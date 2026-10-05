# Stack-specific security pitfalls

Failure modes that are easy to miss in Next.js (App Router), serverless platforms, Supabase, Prisma and Stripe. This is not a general web-security checklist; it assumes you already check for the standard classes and adds what is particular to this stack.

## Contents

- [Identity and sessions](#identity-and-sessions)
- [Authorization](#authorization)
- [Server Actions](#server-actions)
- [Middleware](#middleware)
- [Supabase](#supabase)
- [Prisma and SQL](#prisma-and-sql)
- [Webhooks](#webhooks)
- [Cron and background routes](#cron-and-background-routes)
- [Secrets and the client bundle](#secrets-and-the-client-bundle)
- [Abuse and rate limiting](#abuse-and-rate-limiting)
- [SSRF, redirects and rendering](#ssrf-redirects-and-rendering)
- [Uploads](#uploads)
- [CORS, cookies and headers](#cors-cookies-and-headers)
- [Dependencies](#dependencies)

## Identity and sessions

- `jwt.decode` (jsonwebtoken) and `decodeJwt` (jose) read a token without checking its signature. Anything that trusts their output is trusting the client. Look for `verify` / `jwtVerify` with an explicit algorithm list.
- A fallback secret such as `process.env.JWT_SECRET || "dev-secret"` means production silently signs with a public string when the variable is missing. The secret should fail at startup instead.
- Tokens with no expiry, and logout that only deletes the cookie while the token stays valid.
- Session cookies set without `httpOnly`, `secure` and `sameSite`. `cookies().set(name, value)` with no options sets none of them.
- Passwords hashed with a fast digest (SHA-256, MD5) instead of bcrypt, scrypt or argon2; hash comparison with `===`.
- Login and reset responses that reveal whether an account exists, through the message, the status code or the timing.

## Authorization

- The classic: a handler authenticates, then loads by id alone. `findUnique({ where: { id } })` returns anyone's record. Ownership belongs in the query (`where: { id, userId }`), and the same goes for `update`, `delete`, `updateMany` and `deleteMany`.
- `include` and missing `select` return whole related rows. An order that includes its `user` usually ships the password hash and email with it.
- Mass assignment: `data: body` or `data: { ...body }` lets the caller set `role`, `credit`, `ownerId` or `emailVerified`.
- Role read from the token or the request instead of the database. For admin and money actions, check the current role server-side.
- An admin route protected only by being unlinked or by a client-side redirect.
- List endpoints with no tenant or owner filter, and exports that take a user id from the query string.

## Server Actions

- Every exported function in a `"use server"` file is a public POST endpoint. It can be called by anyone who can reach the site, with any arguments, whether or not a page renders its form. Each action needs its own authentication, authorization and input validation.
- Arguments passed with `.bind(null, id)` and hidden form fields are client-controlled. Values captured in a closure are encrypted, but that is not an authorization check.
- Actions return values to the client; returning a full database row leaks its columns.
- Actions get a same-origin check from the framework. Route handlers do not.

## Middleware

- `middleware.ts` (named `proxy.ts` from Next.js 16) runs only on paths its `matcher` covers. A matcher of `/dashboard/:path*` protects no `/api` route. Compare the matcher against the full route list.
- Middleware usually checks that a cookie exists, not that it is valid. Treat it as a redirect convenience and expect every handler, action and server component that reads private data to check the session itself.
- Next.js versions before the fix for CVE-2025-29927 allowed middleware to be skipped with a crafted header. Middleware-only authorization on an old version is a finding on its own.

## Supabase

- The anon key is public by design. The `service_role` key bypasses Row Level Security completely and must never have a public prefix, be imported into a client component, or be used to build a browser client.
- RLS must be enabled on every table in an exposed schema. A table without it is readable and writable by anyone holding the anon key, directly through the REST API, regardless of what the app's own routes do.
- Policies that are effectively open: `using (true)`, a policy for `select` but none restricting `update`, or policies that compare against a column the user can set.
- `user_metadata` is editable by the user. Authorization data belongs in `app_metadata` or a table.
- On the server, `auth.getSession()` reads the cookie without revalidating it against the auth server. Use `auth.getUser()` (or verified claims) for anything that gates access.
- Views run with the owner's rights unless created with `security_invoker`, so a view can bypass RLS on its base tables.
- Storage buckets have their own policies; a public bucket serves every object to anyone with the URL.
- You cannot see dashboard-only configuration from the repo. If policies are not in migrations, report RLS as **Needs verification** and say what to check.

## Prisma and SQL

- `$queryRawUnsafe` and `$executeRawUnsafe` with interpolated input are SQL injection. The tagged-template forms `$queryRaw` and `$executeRaw` are parameterized, unless `Prisma.raw` is used inside them.
- Identifiers cannot be parameterized. Sort columns and directions from the client need an allowlist.
- Passing a parsed JSON body straight into `where` lets the caller send operator objects (`{ "email": { "contains": "" } }`) and change the meaning of the filter. Validate to primitives first.
- `child_process` with string commands built from input; prefer `execFile` with an argument array.

## Webhooks

- The signature must be verified against the raw body. In a route handler that means `await req.text()` and then `stripe.webhooks.constructEvent(raw, signature, secret)`. A handler that calls `req.json()` and trusts `event.type` accepts forged events from anyone, and for payment webhooks that means free credit.
- Providers retry. Without deduplication on the event id (a unique column or processed-events table), a retry grants the entitlement twice.
- Amounts and user ids should come from the verified event or from your own database record, not from client-supplied metadata that was never checked.
- Custom HMAC verification should compare with `crypto.timingSafeEqual` and reject old timestamps.

## Cron and background routes

- A cron route is an ordinary public URL. Vercel sends `Authorization: Bearer <CRON_SECRET>` only when the `CRON_SECRET` variable is set, and the handler has to compare it. Without that check anyone can trigger the job, which is usually a delete, an email blast or a billing run.
- Comparing the header against `"Bearer " + process.env.CRON_SECRET` without first checking that the variable is set makes the expected value the literal string `Bearer undefined` wherever the variable is missing, and anyone can send that.
- The same applies to queue consumers and "internal" endpoints called by other services: verify the provider's signature (QStash, Inngest and others each supply one).
- A cron path in `vercel.json` that matches no route means the job never runs. That is a reliability finding, and worth reporting when it guards cleanup or billing.

## Secrets and the client bundle

- Anything prefixed `NEXT_PUBLIC_` (or `VITE_`, `PUBLIC_`) is inlined into JavaScript served to every visitor at build time. A secret behind such a prefix is already leaked.
- A server module imported by a client component can drag its code and constants into the bundle. `import "server-only"` at the top of server modules turns that into a build error.
- Check for env files tracked by git, secrets in logs and error responses, and source maps published to production.
- When you find one: name and location in the report, rotation as the user's action, never the value.

## Abuse and rate limiting

- A rate limiter backed by a `Map` or module variable does nothing on serverless. Each instance has its own memory and instances are created and destroyed constantly. Limits need a shared store (Upstash, Redis, the database).
- Limits keyed on a value the caller chooses (an email in the body) can be dodged and can lock out a victim. Combine identity and IP.
- Endpoints that cost money per call (LLM calls, email and SMS sending, exports, image processing) need authentication and a limit even when nothing secret is behind them.

## SSRF, redirects and rendering

- `fetch(userSuppliedUrl)` on the server reaches internal services and cloud metadata addresses. Allowlist hosts where possible; otherwise resolve and reject private, loopback and link-local ranges, and re-check after redirects.
- `redirect(next)` or `NextResponse.redirect(next)` with a caller-supplied target is an open redirect. Accept only same-origin relative paths. A bare `startsWith("/")` check is not enough: `//evil.example` and `/\evil.example` pass it and resolve to another host.
- `dangerouslySetInnerHTML` with stored content, `href={userValue}` (allows `javascript:`), and Markdown rendered with raw HTML enabled.
- Error responses that include `err.stack`, `String(err)` or raw database errors.

## Uploads

- Trusting the client's MIME type or extension; no size limit; user-chosen file names used in storage paths.
- SVG and HTML uploads served from the app's own origin run script in that origin.
- Signed upload URLs issued without checking who is asking or what path they may write to.

## CORS, cookies and headers

- The exploitable CORS mistake is reflecting the request's `Origin` together with `Access-Control-Allow-Credentials: true`. A literal `*` with credentials is refused by browsers, but it shows the intent was to allow everything and is worth flagging.
- Cookie-authenticated route handlers that change state on `GET`, or accept cross-site form posts with `sameSite: "none"`.
- Missing baseline headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `frame-ancestors` or `X-Frame-Options`, `Referrer-Policy`. A CSP that needs `unsafe-inline` for scripts is mostly decorative; nonces are the usual fix in Next.js.

## Dependencies

- Run the package manager's audit and read the advisories for the installed versions of `next` and `react` specifically. Framework-level issues have been severe, including the middleware bypass above and the React Server Components remote code execution disclosed in December 2025 (CVE-2025-55182). An outdated framework version can outweigh every application-level finding.
- Lockfile missing or not committed, so production may install different versions than were tested.

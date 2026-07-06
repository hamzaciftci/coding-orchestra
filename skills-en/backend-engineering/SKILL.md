---
name: backend-engineering
description: Production backend for Nextjs Nodejs serverless - API endpoints, auth, authorization IDOR, validation, rate limiting, transactions, webhooks, cron, caching. Use when building or auditing backend routes services or APIs.
trigger: /backend-engineering
---

# BACKEND_ENGINEERING_SKILL

## Purpose
Perform **production-quality backend development** on APIs, route handlers, auth systems, database access, background jobs, and serverless functions.

Use cases:
- Writing new API endpoints / route handlers
- Setting up or fixing auth (authentication/authorization) systems
- Developing webhooks, cron jobs, and background jobs
- Backend bug fixing and performance improvement
- Bringing an existing backend up to production standard

## Role
**Senior Backend Architect.** An engineer who has designed high-traffic production APIs, works with a security-and-scalability-first mindset, and has deep command of the Node.js/TypeScript/serverless ecosystem (Next.js API routes, Vercel functions, PostgreSQL/Supabase/Prisma).

## Working Principles
1. **Every endpoint is an attack surface.** No endpoint is considered complete without accounting for auth checks, input validation, and rate limiting.
2. **Trust the server, not the client.** No value coming from the client (role, price, userId, isAdmin) is trusted; all of them are validated/recomputed on the server.
3. **Explicit > implicit.** Response formats, error codes, and status codes must be standard and predictable.
4. **Data integrity is sacred.** Flows involving multiple write operations are performed inside a transaction.
5. **Idempotency is the default mindset.** Every payment, webhook, or retried operation must produce no side effects when run again.
6. **Know the serverless constraints:** cold start, execution timeout, connection pooling (PgBouncer/Prisma Accelerate/Supabase pooler), stateless execution, ephemeral file system.

## Workflow
1. **Analyze the project:** Framework (Next.js App Router or Express?), ORM, auth solution (NextAuth/Supabase Auth/Clerk/custom JWT), the existing middleware chain.
2. **Understand the file structure:** Where the routes are, whether there is a service layer, where validation happens, what the current response format is.
3. **Check dependencies:** How the DB client is instantiated (is there a singleton pattern for serverless?), where env variables are read.
4. **Find existing bugs:** Endpoints without auth, unvalidated input, multiple writes without a transaction, N+1 queries, verbose error message leakage.
5. **Surface the risks:** The endpoints affected by the change, backward compatibility (will existing clients break?).
6. **Create a solution plan** and present it briefly.
7. **Implement:** In the order validation → auth → business logic → data access → response.
8. **Test:** Validate the endpoint with a success scenario + error scenarios + unauthorized-access scenario.
9. **Report.**

## Backend Standards (Mandatory Scope)

### API Design and REST Endpoint Standard
- Resource-oriented URLs: `/api/orders`, `/api/orders/[id]` — noun, not verb (`/api/getOrders` ❌).
- Semantic HTTP methods: GET (read, no side effects), POST (create), PUT/PATCH (update), DELETE (delete).
- Correct status codes: 200/201/204, 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404, 409 (conflict), 422, 429 (rate limit), 500.
- 404 vs 403 decision: if you must not leak the existence of the resource, return 404 for unauthorized access too.
- Use a `/api/v1/` prefix when versioning is needed; on a breaking change, do not remove the old version immediately.

### Route Handler Logic (standard order)
Each handler is written in this order:
1. **Rate limit check** (on sensitive endpoints)
2. **Authentication** — who is this?
3. **Authorization** — are they allowed to do this? (including resource ownership — IDOR protection)
4. **Input validation** — parse body/query/params with a Zod schema
5. **Business logic** — in the service layer, not in the handler
6. **Standard response** — consistent format, correct status

### Authentication
- Session/token verification is performed server-side on every protected route; even if there is middleware, it is re-verified inside the route (defense in depth).
- If JWT is used: short expiry, correct `alg` check (`none` is rejected), a secret of at least 32 random bytes, refresh token rotation.
- Passwords are hashed only with bcrypt/argon2. Comparison is done in a timing-safe manner.
- On login failures, do not reveal "was it the email or the password that was wrong" ("Invalid credentials").

### Authorization
- On every write/read operation, **resource ownership** is checked: `WHERE id = ? AND user_id = ?` — only `WHERE id = ?` ❌ (IDOR).
- Role checks are done on the server, based on the current role in the DB; the role inside the token is not blindly trusted (verify from the DB for critical operations).
- Admin endpoints pass through a separate guard; a "secret URL" is not security.
- If Supabase is used, RLS (Row Level Security) policies are mandatory; the service-role key stays only on the server, never in the client bundle.

### Rate Limiting
- Mandatory on login, register, password-reset, OTP, payment, and costly endpoints.
- In-memory counters do not work in serverless; use an external store like Upstash Redis / Vercel KV.
- Keyed by userId for authenticated users, by IP for anonymous ones. Return 429 + a `Retry-After` header.

### Input Validation
- Schema-based validation with Zod (or an equivalent); `safeParse` + field-level error messages.
- Whitelist approach: accept only the expected fields (`strict()`), discard the rest. Mass-assignment protection: passing the client-provided object directly into `prisma.update({ data: body })` ❌.
- String length limits, numeric ranges, enum checks, email/URL format checks.
- On file upload: MIME type + magic byte check, size limit, filename sanitization, storage under a random name.

### Error Handling
- Centralized error catching: known errors (an AppError class) return with their message, unknown errors return with a generic "Internal server error".
- Stack traces, SQL errors, and file paths never leak to the client; these are written only to the server log.
- A machine-readable `code` field in every error response (e.g. `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`).

### Logging
- Structured (JSON) logs: timestamp, level, requestId, userId (if any), event, duration.
- Never log: passwords, tokens, card details, full PII. Mask when needed (`em***@gmail.com`).
- Critical events are logged: failed login attempts, authorization denials, payment events, data deletions.

### Database Transaction Logic
- Multiple related writes → `prisma.$transaction` / `BEGIN...COMMIT`.
- No external API calls inside a transaction (risk of long locks + inconsistency); external calls happen as separate steps before/after with compensation logic.
- For operations prone to race conditions such as stock decrement or balance updates, use an atomic update (`UPDATE ... SET stock = stock - 1 WHERE stock > 0`) or a row lock.

### Background Jobs & Cron Jobs
- Long-running work (email, reports, media processing) is moved out of the request/response cycle: a queue (QStash/Inngest/Trigger.dev) or Vercel cron.
- Cron endpoints are protected with a `CRON_SECRET` (Vercel `Authorization: Bearer` header check); an open cron endpoint is a critical vulnerability.
- Every job is written to be idempotent: if it runs twice, it must not send two emails (marking processed records / dedup key).
- On job failures: retry + max attempts + dead-letter record.

### Webhook Security
- Every webhook passes signature verification (Stripe: `stripe.webhooks.constructEvent`, others: HMAC + timing-safe compare).
- Verification is done with the raw body (the signature won't match a parsed body — watch out for the body parser in Next.js).
- Replay protection: timestamp tolerance + event id dedup.
- The webhook handler returns quickly (200), heavy work is pushed to a queue.

### Cache Strategy
- Separate the layers: HTTP cache (`Cache-Control`, `s-maxage`, `stale-while-revalidate`), application cache (Redis/KV), Next.js data cache (`revalidate`, `revalidateTag`).
- User-specific data is never written to a shared cache (CDN) — use `private` or `no-store`.
- An invalidation plan is written for every cache; a cache without a plan is not added.

### Serverless Compatibility
- DB client as a global singleton (`globalThis` pattern) — a new connection on every request ❌.
- Plan the work around the function timeout (Vercel Hobby ~10s); long work goes to a queue.
- Work done in the global scope adds to cold-start cost; avoid heavy init.
- In-memory state (counters, cache, session) is not trusted — each invocation may be a different instance.

### Environment Variable and Secret Management
- All env variables are validated at startup with a Zod schema (`env.ts`); if any are missing, fail-fast with a meaningful error.
- Anything with the `NEXT_PUBLIC_` prefix ships to the client — a secret is never `NEXT_PUBLIC_`.
- `.env*` files are in `.gitignore`; `.env.example` is kept up to date (no values, only key names).
- Secrets are read from a single place so that rotation is possible.

### API Response Standard
```ts
// Success
{ "success": true, "data": {...}, "meta": { "page": 1, "pageSize": 20, "total": 143 } }
// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {...} } }
```
If the project has a different standard, follow THAT one; the two formats are not mixed.

### Pagination, Filtering, Sorting
- Pagination is mandatory: a listing endpoint never returns unlimited records. The `limit` upper bound is enforced on the server (e.g. max 100).
- Cursor-based for large/real-time lists; offset is acceptable for simple admin lists.
- Sort/filter fields go through a whitelist — the column name provided by the client does not go directly into SQL/orderBy (injection + information leakage).

### Idempotency
- Support for an `Idempotency-Key` header on payments and critical POST operations: a second request with the same key returns a copy of the first result.
- Duplicate records are prevented with a unique constraint in the DB (application-level checks alone are not enough).

### Retry Strategies
- On external API calls: timeout (AbortController) + exponential backoff + jitter + max retry.
- Only idempotent/safe operations are retried; retried POSTs carry an idempotency key.
- Circuit-breaker thinking: don't hammer a continuously failing dependency in a loop.

### Production Monitoring
- Error tracking (Sentry etc.) wired into the backend; unhandled rejections are caught.
- A health check endpoint (`/api/health`): DB connection + critical dependency check.
- Visibility into slow queries and slow endpoints (log durations, Vercel analytics).

### Backend Security Checklist (for every endpoint)
- [ ] Is there an auth check, and is it in the right layer?
- [ ] Is there a resource ownership (IDOR) check?
- [ ] Is input validated with Zod? Is mass-assignment disabled?
- [ ] Is SQL injection impossible (parameterized queries/ORM, placeholders in raw SQL)?
- [ ] Is rate limiting needed, and is it present?
- [ ] Does the error response leak information?
- [ ] Do secrets come from env, and do they leak into logs?
- [ ] Are multiple writes inside a transaction?
- [ ] Is the response standard maintained?

## How Should the AI Behave?
- Before writing an endpoint, read an existing endpoint in the project as an example; derive the auth/validation/response pattern from it.
- Ask "who should be able to access this endpoint?" every single time and implement the answer in the code.
- Before making a change, find the client code that calls that endpoint; if the contract is breaking, report it.
- Rushing and skipping auth/validation with "we'll add it later" is forbidden — even skeleton code is born with these layers.
- Report after every change; if it wasn't tested, write "not tested".

## Critical Warnings
- ⚠️ Never put a service-role key / admin credential on the client side, never in git.
- ⚠️ For migrations and destructive DB operations, present a plan first; do not run without approval.
- ⚠️ Do not silently change the existing API contract (field names, status codes) — the frontend will break.
- ⚠️ Do not disable webhook signature verification even "for testing".
- ⚠️ If you write raw SQL, use only parameterized queries; string interpolation is strictly forbidden.

## Safe Order to Follow When Changing Code
1. **Read first** — the route, service, schema, and calling client code.
2. **Then analyze** — auth flow, data flow, contract, race conditions.
3. **Then plan** — endpoint list, schema changes, backward compatibility.
4. **Then make small changes** — proceed endpoint by endpoint.
5. **Then test** — success + error + unauthorized + invalid input scenarios.
6. **Then report.**

## To Do
- ✅ Order in every handler: rate limit → authn → authz → validation → business logic → standard response.
- ✅ Validate all env variables at startup.
- ✅ Wrap multiple writes in a transaction; resolve race conditions with atomic queries.
- ✅ Protect cron and webhook endpoints with a signature/secret.
- ✅ Add pagination + a limit upper bound to listing endpoints.
- ✅ Add timeout + retry to external API calls.
- ✅ Use a DB client singleton in serverless.

## Not To Do
- ❌ Leaving a protected endpoint without an auth check.
- ❌ Trusting the userId/role/price coming from the client.
- ❌ Passing an unvalidated body directly to the ORM (mass-assignment).
- ❌ Building SQL with string interpolation.
- ❌ Leaking a stack trace/internal details in an error message.
- ❌ Multiple writes without a transaction; queries inside a loop (N+1).
- ❌ Assuming security in serverless with in-memory rate limit/session.
- ❌ Writing a secret into code or into a `NEXT_PUBLIC_` variable.
- ❌ A list endpoint that returns unlimited records.

## Checklist
- [ ] Typecheck + lint + build pass
- [ ] For every new/changed endpoint: auth, authz, validation, rate limit evaluated
- [ ] Error scenarios tested (400/401/403/404/409/429)
- [ ] Response standard is consistent
- [ ] Transactions and idempotency applied where needed
- [ ] Logs added, no secret/PII leakage
- [ ] If there is an API contract change, the frontend impact is reported
- [ ] Backend security checklist checked off for every endpoint

## Reporting Format
1. **Analysis performed** (existing backend structure, auth model, detected patterns)
2. **Problems found** (security/performance/consistency)
3. **Changes made** (per endpoint)
4. **Files touched**
5. **Why this solution**
6. **Security impact** (risks closed/introduced)
7. **Performance impact** (query count, cache, timeout)
8. **Test result** (actual results per scenario)
9. **Remaining risks**
10. **Next recommendations**

## Usage Prompt
```
Load and apply the /backend-engineering rules.
Task: [e.g. "Audit all API endpoints of this project against this skill and bring them up to production standard" or "Write the endpoints for feature X according to this skill"]
Check off the security checklist for each endpoint, and report contract changes separately.
```

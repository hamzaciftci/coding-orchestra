# Webhooks, jobs, money and the serverless runtime

## Contents

- [Webhooks](#webhooks)
- [Cron and background jobs](#cron-and-background-jobs)
- [Idempotency and money](#idempotency-and-money)
- [Transactions and races](#transactions-and-races)
- [Rate limiting](#rate-limiting)
- [External calls](#external-calls)
- [Caching](#caching)
- [Runtime](#runtime)
- [Configuration](#configuration)

## Webhooks

- Verify the signature over the raw request body before doing anything else. In an App Router route handler: `const raw = await req.text()`, then the provider's verifier (`stripe.webhooks.constructEvent(raw, req.headers.get("stripe-signature"), secret)`). Parsing with `req.json()` first changes the bytes and either breaks verification or tempts someone to skip it.
- Never disable verification to make local testing easier. Use the provider's CLI or a test secret.
- Deduplicate on the provider's event id with a unique constraint; providers redeliver.
- Take amounts, plan and customer from the verified event or your own records.
- Acknowledge quickly. If processing is slow, record the event and process it in a job, because providers time out and retry.
- Events arrive out of order. Decide state from the event's data or by fetching the current object, not from arrival order.

## Cron and background jobs

- A cron route is a public GET. Check `Authorization: Bearer <CRON_SECRET>` and confirm the variable is set; comparing against an unset variable matches the string `Bearer undefined`.
- The path in `vercel.json` must match the route exactly.
- Jobs must be safe to run twice and safe to overlap with themselves: mark rows as processed, or claim work with an atomic update.
- Work that may exceed the function's time limit is split into batches or moved to a queue (QStash, Inngest, Trigger.dev or what the project already uses). Verify the queue provider's signature on the consuming endpoint.
- Sending email or doing slow work inside a request makes the request slow and loses the work if the function is frozen. Use `after()` / `waitUntil` for short follow-ups and a queue for the rest.

## Idempotency and money

- For payment and other costly POSTs, accept an idempotency key, store it with a unique constraint next to the result, and return the stored result on a repeat.
- Enforce "only once" in the database (unique index on the natural key) as well as in code. An application-level check alone loses to two concurrent requests.
- Compute prices and totals on the server from your own data. A price, discount or user id from the client is a suggestion.
- Store money as integer minor units or `numeric`/`Decimal`. Floats lose cents.

## Transactions and races

- Related writes that must succeed or fail together go in one transaction.
- Keep network calls out of transactions. Call the external service before or after, and have a compensation step for the case where one side succeeds and the other fails.
- Read-then-write is a race. Use an atomic statement (`UPDATE ... SET stock = stock - 1 WHERE id = $1 AND stock > 0` and check the affected row count) or a row lock.
- In Prisma, the array form of `$transaction` is one round trip; the interactive form holds a connection for its whole duration.

## Rate limiting

- State in a module variable does not limit anything on serverless. Use a shared store (Upstash Ratelimit, Redis, or a database table for low volumes).
- Key by user id when authenticated and by IP otherwise; for login, limit by both account and IP so neither enumeration nor lockout of a victim is easy.
- Limit what costs money or leaks information: login, signup, reset, OTP, anything calling an LLM or sending messages, exports.

## External calls

- Every outbound call has a timeout (`AbortSignal.timeout(ms)`). A hung upstream otherwise consumes the whole function duration.
- Retry only idempotent operations, with backoff and a small cap. A retried non-idempotent POST needs an idempotency key on the upstream API.

## Caching

- Check the caching defaults of the installed Next.js version for `fetch`, GET route handlers and `unstable_cache` / `use cache`; they changed between major versions.
- Per-user data must never land in a shared cache. Responses that depend on the session need dynamic rendering or `Cache-Control: private, no-store`.
- Add a cache only together with its invalidation: which mutation clears it, and how.

## Runtime

- Create the database client once per instance and reuse it (`globalThis` guard in development). Use the pooled connection string; see the `deployment-readiness` skill for pooler details.
- Use the edge runtime only for code that needs nothing from Node. Database drivers, `fs`, `crypto` beyond Web Crypto and many SDKs do not run there.
- The file system is not durable; persist files to object storage.
- Keep module top-level light. Everything imported at the top is paid for on every cold start.

## Configuration

- Read environment variables in one module that validates them at startup and exports typed values. A missing variable should stop the app from booting.
- Server-only values never get a public prefix, and modules that hold them start with `import "server-only"`.
- When you add a variable, add its name to the example file in the same change.

---
name: backend-engineering
description: Builds and changes server-side code in Next.js and Node serverless apps so that it holds up in production, covering route handlers, Server Actions, authentication and per-record authorization, input validation, webhooks, cron and background jobs, payments and idempotency, rate limiting and caching. Use when adding or modifying an API endpoint, Server Action, webhook, cron job or auth or payment flow, or when reviewing backend code for production readiness.
license: MIT
compatibility: Written for Next.js (App Router) and Node on serverless hosts with PostgreSQL via Prisma or Supabase. The questions apply to any backend.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Backend engineering

Before writing anything, read one or two existing endpoints close to the one you are changing and find how this project does authentication, validation, error responses and data access. The project's conventions win over the defaults suggested here; mixing two styles in one API is worse than either. Use the defaults below only where the project has no convention yet.

## What "done" means for server code

A handler or action is finished when each of these has a deliberate answer. Some answers are "not needed here", and that is fine if it is a decision.

1. **Who may call this?** Authentication is checked inside the handler or action itself. Middleware and UI gating do not count: route handlers and Server Actions are public URLs.
2. **May this caller touch this record?** Ownership or tenant goes into the query's `where`, for reads and writes alike. Role comes from the server's view of the user.
3. **What shape of input is accepted?** Parsed against a schema, with only the listed fields passed on. A raw body never reaches the ORM.
4. **What happens when it runs twice?** Double clicks, client retries, provider redelivery and concurrent requests all happen. Use unique constraints, idempotency keys, atomic updates or transactions where a repeat would cost money or corrupt state.
5. **What does failure look like?** The right status code, a stable machine-readable error code, and no stack traces, SQL or internal paths in the response.
6. **What does it cost to call?** Anything that sends email, calls a paid API, runs a heavy query or guesses credentials needs a limit that survives multiple instances.
7. **Who consumes the response?** Find the callers before changing a field name, type, status code or error shape. If the change breaks them, update both sides together or keep the old shape working.

## Where this stack differs from a long-running server

Serverless and the App Router change several things a model trained on Express-style servers gets wrong by default: in-memory state does not persist, connections must be pooled, the edge runtime lacks Node APIs, webhook signatures need the raw body, cron routes are public, and caching defaults vary by Next.js version.

- Read [references/request-handling.md](references/request-handling.md) when writing or reviewing handlers and actions: auth, authorization, validation, errors, response shape, pagination.
- Read [references/async-and-runtime.md](references/async-and-runtime.md) when the work involves webhooks, cron, queues, payments, transactions, rate limits, caching or runtime configuration.

## Stop and ask first

Present a plan and wait for approval before: running a migration or any destructive data operation, changing how login or sessions work, breaking a published API contract, or adding a new infrastructure dependency (queue, cache, auth provider). These are hard to reverse or affect people outside this change.

## Verifying

Exercise each new or changed endpoint for the success case, invalid input, no session, and a session that belongs to a different user. Run the project's typecheck, lint and tests. Report what was run and what was not; "not tested" is an acceptable line in a report, an unrun test described as passing is not.

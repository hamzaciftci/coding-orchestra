# Audit lenses

Six views of a project. Each names the specialist skill that goes deeper and gives a fallback summary of what to look for when that skill is not installed. A lens returns findings with `path:line` evidence and a proposed severity; it does not change code.

## Contents

- [Security](#security)
- [Backend](#backend)
- [Data and contracts](#data-and-contracts)
- [Frontend](#frontend)
- [Tests](#tests)
- [Deployment](#deployment)
- [Briefing a subagent](#briefing-a-subagent)

## Security

Skill: `security-audit`.

Map every externally reachable entry point (route handlers, Server Actions, webhooks, cron routes, admin routes, uploads), then for each one trace who can call it, what input they control and what it touches. Stack-specific things to check: ownership filters in queries, Server Actions without their own auth, middleware matcher gaps, webhook signature verification over the raw body, cron routes without a secret check, secrets behind a public prefix, service-role keys reachable from client code, row level security on every exposed table, in-memory rate limiting, raw SQL with interpolation, open redirects and server-side fetches of user-supplied URLs.

## Backend

Skill: `backend-engineering`.

For each handler and action: authentication inside the handler, validated and allowlisted input, consistent error and response shape, no internal details in errors, bounded list endpoints. Across the backend: idempotency of payments, webhooks and jobs; transactions around related writes; races on counters and balances; timeouts on outbound calls; database client reuse; environment variables validated at startup.

## Data and contracts

Skill: `database-api-design`.

Schema, ORM models and types in agreement. Constraints that enforce the business rules (not null, foreign keys with deliberate delete behaviour, unique, check). Money and time types. Indexes for the real query patterns and on foreign keys. Migration history that can be applied cleanly, and pending changes that would need staging. Responses that select explicit fields. Whether any pending work would break existing clients.

## Frontend

Skill: `frontend-engineering`.

Loading, empty, error and success states on the main screens. Forms: validation, busy state, double-submit protection, preserved input. Keyboard access, labels, focus, contrast. Layout at mobile width. Theme tokens versus hardcoded colours. Client/server component boundary and bundle weight. Visual consistency and copy quality on the screens that carry the product. Screens showing mock data with no backend behind them.

## Tests

Skill: `testing-qa`.

What exists and whether it runs. Whether a test would fail if an ownership check, a webhook signature check or a validation rule were removed. Coverage of the critical user flow end to end. Flaky or skipped tests. Whether tests can run without real credentials or shared data.

## Deployment

Skill: `deployment-readiness`.

Build gate status and any error-suppression flags. Environment variables used versus documented. Edge runtime misuse, connection pooling, reliance on in-memory state or local files. Migration command and ordering. Cron paths and protection. Error tracking and a health endpoint. Robots and metadata. Rollback path.

## Briefing a subagent

When delegating a lens, give the subagent: the project path, the product's purpose and main flows in two or three sentences, the single lens it owns with the skill to use, that the task is read-only, and the return format (a list of findings, each with title, proposed severity, `path:line`, why it matters, and whether it was confirmed in code or needs verification). Ask it to report "nothing found" for areas it checked and found clean, so absence of findings is distinguishable from absence of checking.

# Risk-based test plan

## Contents

- [Plan template](#plan-template)
- [Authorization matrix](#authorization-matrix)
- [Route handlers and Server Actions](#route-handlers-and-server-actions)
- [Webhooks](#webhooks)
- [Cron and jobs](#cron-and-jobs)
- [Database-backed tests](#database-backed-tests)
- [End-to-end with Playwright](#end-to-end-with-playwright)
- [Security regressions worth keeping forever](#security-regressions-worth-keeping-forever)
- [Flakiness](#flakiness)
- [Release smoke](#release-smoke)

## Plan template

| Risk | Guarded by | Current test | Gap | Test to add | Level |
|---|---|---|---|---|---|
| User reads another user's order | `where: { id, userId }` in orders route | none | yes | GET as user B returns 404 | integration |
| Paid twice on webhook retry | unique index on event id | none | yes | same event twice, one credit | integration |

Order by cost of failure. Level is the cheapest one that exercises the real guard: unit for pure logic, integration for anything involving the database or auth, end to end only for flows that cross the whole stack.

## Authorization matrix

One row per protected operation, one column per kind of caller. Fill in the expected status, then write one test per cell that is not a plain success.

| Operation | Anonymous | Owner | Other user | Admin |
|---|---|---|---|---|
| GET /api/orders/:id | 401 | 200 | 404 | 200 |
| PATCH /api/profile (role field) | 401 | 200, role unchanged | n/a | 200 |
| action deleteProject | error | ok | error, row still exists | ok |

For write operations, assert on the database afterwards as well as on the response: the other user's row must be unchanged.

## Route handlers and Server Actions

- App Router handlers are functions that take a `Request`. Import and call them with a constructed request and a mocked session helper, or run them against a local server; follow what the project does.
- Server Actions are exported functions. Call them directly with the session helper mocked for each caller in the matrix. Test that bound or hidden arguments are not trusted.
- Async server components are awkward to unit test. Cover them through end-to-end tests and keep logic in plain functions that can be tested alone.
- For each endpoint: success, invalid input (and that nothing was written), no session, wrong user, not found, conflict where relevant, and the rate limit if it has one.
- Assert the response contains no fields it should not (`passwordHash`, internal flags).

## Webhooks

- Keep signature verification on in tests. Generate a valid signature with a test secret: Stripe's library provides `stripe.webhooks.generateTestHeaderString({ payload, secret })`; for plain HMAC schemes compute it in the test.
- Cases: valid signature processes; missing or wrong signature returns 400 and writes nothing; a body altered after signing is rejected; the same event id twice has one effect; an unknown event type is acknowledged and ignored.

## Cron and jobs

- No header and wrong secret return 401 and do nothing; the right secret runs the job.
- Run the job twice and assert the effect happened once.
- With the secret variable unset, the route must still reject requests.

## Database-backed tests

- Use a real PostgreSQL for integration tests (a local container, a test schema or a branch database). Mocks of the ORM do not catch constraint, transaction or query bugs, which are the ones that matter.
- Isolate tests: a transaction rolled back per test, truncation between tests, or a schema per worker. Parallel runs need per-worker isolation.
- Point the test database through its own variable and make the setup refuse to run if the URL does not look like a test database.
- Build data with small factories so each test states only what it cares about.

## End-to-end with Playwright

- Cover the few flows the business depends on: sign up, sign in, the main create-read-update-delete path, checkout in provider test mode, sign out.
- Locate by role and accessible name (`getByRole`, `getByLabel`), then by test id. Class names and DOM structure change too often.
- Authenticate once in a setup project and reuse `storageState`; keep one test that goes through the real login form.
- Web-first assertions (`await expect(locator).toBeVisible()`) wait on their own. Remove fixed sleeps.
- Run the critical flow at a mobile viewport as well, and add an `@axe-core/playwright` scan on the key pages.
- Each test creates its own data and does not depend on another test's leftovers.

## Security regressions worth keeping forever

- A second user gets 404 or 403 on every record endpoint and action.
- Privileged fields in a request body are ignored or rejected.
- A token with a bad signature, an expired token and a token signed with the wrong algorithm are rejected.
- Unsigned or replayed webhooks are rejected or ignored.
- Cron routes reject requests without the secret.
- A sort or filter parameter outside the allowlist is rejected.
- A redirect parameter pointing at another host is not followed.

## Flakiness

Usual causes: real time (use fake timers or an injected clock), random data without a seed, tests sharing rows, relying on order, unawaited promises, animations and network calls to real services. Retries in CI are acceptable as a temporary signal, never as the fix.

## Release smoke

After a deployment: main pages respond, sign in works, the health endpoint is green, the critical flow completes once, and the error tracker shows no new spike. The `deployment-readiness` skill has a script for the HTTP part.

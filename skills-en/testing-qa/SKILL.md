---
name: testing-qa
description: Testing and QA - unit integration E2E API auth role IDOR and security regression tests, edge and state-screen tests, smoke test, honest coverage reporting. Use to write tests or set up QA for a project.
trigger: /testing-qa
---

# TESTING_AND_QA_SKILL

## Purpose
Build the testing and quality-assurance layer that proves an application works **correctly, securely, and resiliently**: from unit to E2E, from auth to security regression, from edge cases to production smoke tests.

Use cases:
- Writing tests for a new feature / increasing test coverage of existing code
- Building a regression-prevention safety net of tests
- Pre-release QA and smoke testing
- Adding a "never again" test after a bug

## Role
**Senior QA / Test Engineer (SDET).** An engineer who knows the test pyramid, avoids flaky tests, tests behavior (not implementation), brings security and edge cases into test scope, and is fluent in Vitest/Jest, Testing Library, Playwright, and API testing.

## Working Principles
1. **Test behavior, not implementation.** A test verifies "what it does" from the user's/client's perspective; it doesn't break when internal details change.
2. **Test pyramid:** many fast unit tests, a moderate number of integration tests, a few critical E2E tests. Testing everything with E2E is slow and flaky.
3. **Meaningful coverage > percentage.** The goal is testing critical paths and edge cases, not 100% coverage.
4. **Deterministic tests.** Time, randomness, network, and ordering dependencies are brought under control; a flaky test is an unreliable test.
5. **Every bug spawns a test.** A regression test is added for every fixed bug.
6. **Security is tested.** Auth, authorization, IDOR, and validation tests are as important as functional tests.

## Workflow
1. **Understand the existing test infrastructure:** test runner, libraries, existing tests, CI integration, coverage.
2. **Risk analysis:** the most critical flows, the most fragile areas, past bugs, security-sensitive points.
3. **Test plan:** prioritize what to test and at which level (unit/integration/E2E).
4. **Write the tests:** happy path + edge + error + unauthorized scenarios.
5. **Run and stabilize:** if there's flakiness, fix the root cause.
6. **Report coverage and gaps.**
7. **Prepare a pre-release smoke test plan.**

## Test Types (Mandatory Coverage)

### Unit Test
- Pure functions, helpers, business rules, calculations, reducers/utils.
- Edge inputs: empty, null, boundary values, negative, very large, invalid format.
- Fast and isolated; external dependencies mocked/stubbed.

### Integration Test
- Layers working together: service + DB (test DB / transaction rollback), route handler + validation + repository.
- Against the real schema; is data access correct after a migration.

### E2E Test (Playwright)
- Critical user paths: sign up → sign in → main CRUD → sign out; payment flow (if any, in test mode).
- In a real browser; resilient selectors (role/testid), not tied to CSS classes.

### API Test
- Every endpoint: success (200/201), validation error (400/422), unauthenticated (401), unauthorized (403), not found (404), conflict (409), rate limit (429).
- Response schema/contract validation; field types and envelope consistency.

### Form Test
- Correct submit, per-field validation errors, double-submit prevention, loading/disabled state, success feedback.

### Auth Test & Role/Permission Test
- Sign in/out, session duration, blocking unauthenticated access to protected routes.
- Role matrix: allowed/disallowed actions for each role; blocking vertical (privilege escalation) and horizontal (another user's resource = IDOR) access.

### Security Regression Test
- Tests that verify known vulnerabilities stay closed: an IDOR attempt must return 403/404, mass-assignment must be rejected, an `alg:none` JWT must be rejected, rate limiting must trigger.
- Injection attempts (SQL/NoSQL/XSS payloads) must be handled safely.

### Edge Case Test
- Concurrency/race conditions, empty list, single element, very large list (pagination boundaries), unicode/emoji, time zone, boundary numbers.

### Empty / Error / Loading State Test
- Empty data → empty state; request error → error state + retry; loading → skeleton/loading; render verification for each.

### Mobile Responsive & Browser Compatibility Test
- Critical screens don't break at mobile viewport (Playwright device emulation); no horizontal scroll; touch targets are reachable.
- The basic flow works in target browsers (Chromium/WebKit/Firefox).

### Performance Test
- Response time within acceptable limits on heavy listing/query endpoints; no N+1 (query-count verification).
- Basic Web Vitals / bundle regression check on the frontend.

### Accessibility Test
- Automated a11y scan (axe) on critical pages; keyboard navigation and focus order; label/aria relationships.

### Production Smoke Test
- After deploy: main pages return 200, sign in/out works, health check is green, the critical flow runs end-to-end once; no error spike in the logs.

## Test Quality Rules
- Good test name: "what, under which condition, what is expected" (`returns 403 when accessing another user's order`).
- Arrange-Act-Assert; each test verifies a single behavior.
- No shared mutable state; tests run independently and in any order.
- Time/randomness is injected (fixed seed / fake timers); mock or a test server instead of real network.
- Wait on a condition (waitFor) instead of `sleep`/arbitrary waits.

## How Should the AI Behave?
- Before writing tests, examine the existing test style and infrastructure; use the same pattern.
- Actually run the tests and show the results (pass/fail, counts) in the report; distinguish "written" from "passing".
- Don't write flaky tests; don't leave them without making them deterministic.
- Don't test only the happy path and claim "covered"; add edge + error + unauthorized scenarios.
- Report coverage gaps honestly; don't hide an untested critical path.

## Critical Warnings
- ⚠️ Wrongly "fixing" production code to make a test pass (weakening an assert, loosening a security check) is forbidden.
- ⚠️ Covering up a flaky test with `retry` hides the root cause.
- ⚠️ Tests must not touch the real prod DB/service; use an isolated test environment.
- ⚠️ Tests tightly coupled to implementation break on every refactor — test behavior.
- ⚠️ Don't leave security tests "for later"; regression hurts most there.

## Safe Sequence When Changing Code
1. **Read first** — the code to be tested + existing tests + infrastructure.
2. **Then analyze** — critical paths, edge cases, risk points.
3. **Then plan** — which tests at which level.
4. **Then make small changes** — add tests one by one, run.
5. **Then test** — full suite green + no flakiness.
6. **Then report.**

## Do
- ✅ Distribution aligned with the test pyramid (many unit, moderate integration, few E2E).
- ✅ Success + error + unauthorized scenario for every critical endpoint.
- ✅ Auth, role/permission, and IDOR tests.
- ✅ Security regression tests (for closed vulnerabilities).
- ✅ Empty/error/loading state and edge-case tests.
- ✅ A regression test for every fixed bug.
- ✅ Deterministic, independent, behavior-focused tests.
- ✅ Run the tests and report the real results.

## Don't
- ❌ Testing only the happy path and claiming "covered".
- ❌ Writing fragile tests tightly coupled to implementation details.
- ❌ Covering up a flaky test with retry/sleep.
- ❌ Weakening a security/correctness check to make a test pass.
- ❌ Tests that touch real prod data/services.
- ❌ Writing tests and claiming "passing" without running them.
- ❌ Skipping security and edge-case tests.

## Checklist
- [ ] Full test suite green, no flakiness
- [ ] Critical user paths covered with E2E
- [ ] API endpoints tested with success + error + unauthorized scenarios
- [ ] Auth + role/permission + IDOR tests present
- [ ] Security regression tests added
- [ ] Empty/error/loading + edge-case tests present
- [ ] Regression tests added for fixed bugs
- [ ] Tests are deterministic and independent
- [ ] Coverage gaps reported

## Reporting Format (Test Report)
1. **Analysis performed** (test infrastructure + risk analysis)
2. **Problems found** (coverage gaps, existing breakages, discovered bugs)
3. **Changes made** (added tests, their levels)
4. **Files touched**
5. **Why this solution** (rationale for test-level choices)
6. **Security impact** (added security/regression tests)
7. **Performance impact** (test duration, perf test results)
8. **Test result** (pass/fail counts, suite output, coverage if any)
9. **Remaining risks** (critical paths still untested)
10. **Next recommendations** (coverage-increase priority, CI integration)

## Usage Prompt
```
Load and apply the /testing-qa rules.
Task: Set up the testing and QA layer for this project. Do a risk analysis, write tests aligned with the test pyramid
(unit/integration/E2E/API); add auth, role/permission, IDOR, and security regression tests;
cover empty/error/loading and edge cases. Run the tests, report the real results and coverage
gaps. Prepare a smoke test plan for release.
```

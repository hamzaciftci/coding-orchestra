---
name: testing-qa
description: Plans and writes tests aimed at what actually breaks in production web apps, such as authorization and IDOR matrices, input validation, webhooks, cron jobs, payments, critical user flows end to end and regressions for fixed bugs, using the project's own tooling (Vitest, Jest, Playwright). Use when the user asks to add or improve tests, set up testing or QA, write a test plan, raise meaningful coverage, or verify a fix or a release.
license: MIT
compatibility: Examples assume a TypeScript web app tested with Vitest or Jest and Playwright. The risk-first approach applies to any stack.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Testing and QA

The goal is confidence that the things that would hurt most are checked automatically, not a coverage number. A project with 30 tests on its authorization rules, payment path and main user flow is safer than one with 300 tests on formatters.

## Start from risk

Before writing tests, list what would be expensive if it broke: one user reading another's data, money granted or charged wrongly, data loss, the signup or checkout flow failing, a job that silently stops. Map each to the code that guards it and check whether a test would fail if that guard were removed. That gap list is the test plan. Present it before writing a large suite so the user can adjust priorities.

Then use the project's existing test runner, layout, factories and conventions. If there is no test setup at all, propose the smallest one that fits the stack and get agreement before adding dependencies.

## Where tests pay off in this stack

[references/risk-based-test-plan.md](references/risk-based-test-plan.md) has the authorization matrix template and concrete guidance for testing route handlers, Server Actions, webhooks with real signature verification, cron routes, database-backed code, and end-to-end flows with Playwright. Read it when planning a suite or when testing any of those.

The short version of what to cover first:

- **Authorization as a matrix.** For each protected operation: anonymous, the owner, another user of the same role, and an admin. The "another user" case is the one that finds IDOR and is the one most suites lack.
- **Input rejection.** Unknown fields are not written (mass assignment), invalid shapes return the documented error, and limits hold.
- **Money and repeats.** A webhook with a bad signature is rejected, the same event delivered twice has one effect, concurrent requests cannot overspend.
- **The critical flow end to end**, in a real browser, once.
- **A regression test for every bug fixed**, written to fail before the fix.

## Rules that protect the value of a test suite

- A failing test is information. Do not make it pass by weakening the assertion, deleting the case, loosening a security check in the code under test, or adding a blanket retry. If the test is wrong, say why and fix the test; if the code is wrong, fix the code.
- Tests never touch production or shared data, and never need real credentials. Use a disposable database, provider test modes and fake secrets defined in the test setup.
- A flaky test gets diagnosed (time, ordering, shared state, network, animation) and fixed. Wait for conditions, not durations.
- Test behaviour through public interfaces. Tests bound to implementation details fail on every refactor and stop being trusted.

## Reporting

Report what is now covered in terms of risks, what you ran and its actual result, and what remains untested and why. Do not present a suite as passing unless you ran it and saw it pass; if something could not be run in this environment, say which part.

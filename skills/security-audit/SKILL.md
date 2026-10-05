---
name: security-audit
description: Audits a web application the user owns for exploitable vulnerabilities and fixes them, with depth on Next.js, serverless, Supabase, Prisma and Stripe failure modes such as IDOR, unauthenticated Server Actions, unsigned webhooks, open cron routes and leaked keys. Use when the user asks for a security audit or review, asks whether an app is safe to launch, wants vulnerabilities found or closed, or is responding to a suspected leak or breach.
license: MIT
compatibility: The helper script needs Node.js 18+. Written for Next.js and Node web apps; the method carries over to other stacks.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Security audit

This is defensive work on code the user owns or is authorized to assess, which in practice means the repository in front of you and its local or test environment. Describe how a flaw could be abused in enough detail to justify its severity and to verify the fix. Do not write weaponized exploits or scanners, and do not probe hosts the user does not control. If part of a request targets someone else's system, decline that part and continue with the rest.

## What a good audit delivers

- A complete map of what can be reached from outside, so nothing is missed because nobody looked.
- Findings that each point at a code path. A reader should be able to open the file and see the problem.
- Fixes for what the user asked to have fixed, each verified.
- An honest account of what was not checked and what only the user can do.

## Approach

**Map the surface first.** Run the inventory script from this skill's directory against the project:

```
node scripts/attack-surface.mjs <project-dir>
```

It lists route handlers, Pages API routes, Server Actions, the middleware matcher and vercel.json crons with text signals for auth, validation and risky sinks, then tables found in SQL files with their row level security state, and code patterns worth a look. The output tells you where to read; it is not a list of findings, and a clean line proves nothing. Add what the script cannot see: policies set in a dashboard, storage buckets, edge functions, third-party callbacks.

**Then read each entry point** and answer three questions: who can call this, what do they control, and what does it touch. Follow the caller's identity from the request all the way into the query, including the helper that produces the session: if that helper is wrong, every route that relies on it is wrong. Most serious findings in this stack are a missing link in that chain, and they look fine at a glance.

**Then sweep what does not live in an entry point:** how sessions and cookies are issued, password storage, rendering of stored content, CORS and security headers, what reaches the client bundle, database policies, error responses, and framework and dependency versions. Before writing the report, go back over the script output and check that every route, action, table and pattern line was either reported or deliberately cleared.

Read [references/stack-pitfalls.md](references/stack-pitfalls.md) before judging any area clean. It lists the failure modes specific to Next.js, serverless platforms, Supabase, Prisma and Stripe that generic checklists miss.

**Audit or fix?** If the user asked for an audit, report and change nothing. If they asked to find and fix, apply contained fixes directly (a missing ownership filter, a signature check, an input schema) and stop for approval before changes that alter behaviour for legitimate users or cannot be undone: auth flows, app-wide CORS, CSP or cookie settings, database policies and schema, anything that needs a secret rotated or git history rewritten.

**Verify every fix** with a test or a concrete request sequence that shows the unauthorized path now fails and the legitimate path still works. If you could not run it, say so; do not describe an unrun check as passed.

## Judgment calls that matter

- **Leaked secrets.** Removing a secret from the code does not fix a leak. The secret has to be rotated, and only the user can do that. Report it by variable name and location, never by value, and do not open real env files to confirm it. Rewriting git history is destructive and is the user's decision.
- **Only report what you can point to.** "Nothing found" is a valid result for a category. Mark each finding **Confirmed** (traced in code) or **Needs verification** (depends on something outside the repo, such as dashboard policies or platform env values) so the reader knows which is which.
- **Severity follows what an attacker gains and what they need.** Critical: an anonymous or any logged-in user reaches other users' data, money, admin functions or a secret. High: the same with meaningful preconditions. Medium: limited impact or unlikely preconditions. Low: hardening.
- **Never switch a control off to test something**, and never leave a bypass in place.
- **A fix can break the app.** Tightening CORS, CSP or cookie flags changes behaviour everywhere; check what depends on the current behaviour first.

## Report

Lead with a summary table, most severe first, then one block per finding with the eight fields in [references/report-template.md](references/report-template.md): what, severity and why, location, how it could be abused, the fix, why that closes it, residual risk, and how to verify. Finish with what was out of scope or unverified, and the actions only the user can take.

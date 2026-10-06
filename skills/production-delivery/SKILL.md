---
name: production-delivery
description: Runs an end-to-end production-readiness engagement on a web project, with an audit across security, backend, data, frontend, tests and deployment, a prioritized roadmap, fixes delivered in verified vertical slices and a final go / no-go report. Use when the user wants a whole project finished, taken over, audited end to end or made production-ready, as opposed to one specific change.
license: MIT
compatibility: Works on its own. Goes deeper when the other Coding Orchestra skills (security-audit, backend-engineering, database-api-design, frontend-engineering, testing-qa, deployment-readiness) are installed.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Production delivery

This skill coordinates a whole-project engagement: find out what state the project is really in, agree on what matters, fix it in an order that keeps the project working, and say honestly whether it is ready. It conducts; the specialist skills hold the domain depth.

## Shape of the engagement

**1. Understand.** Learn what the product is for and who uses it, the stack, and how it is deployed. Run the project's own checks (install, typecheck, lint, tests, build) and record what is already broken before you touch anything. Identify the main user flows; if they are not clear from the code, ask.

**2. Audit.** Look at the project through each lens in [references/audit-lenses.md](references/audit-lenses.md): security, backend, data and contracts, frontend, tests, deployment. For each lens, use the matching specialist skill when it is installed; the lens file says what to look for when it is not. The lenses are independent and mostly read-only, so if your environment supports subagents, run them in parallel with one lens each and have each return findings with file references. Check surprising or severe findings yourself before they go in the report. Without subagents, go through them in priority order.

Two project-level checks belong to no single lens: a feature inventory (what exists, what is half-built, what is missing for the stated goal) and a frontend-to-backend contract check (every client call matched to a real endpoint, with field names, types, auth and status codes compared).

**3. Roadmap, then stop.** Turn the findings into one prioritized list using the scale in [references/templates.md](references/templates.md): Blocker, Critical, Major, Minor, Polish. Each item has evidence, impact and rough size. Present it and wait for the user to confirm scope before changing code. If the user asked for an audit only, the engagement ends here with the report.

**4. Deliver in vertical slices.** Take the approved items most severe first. Finish one thing completely (schema, API, UI, test) before starting the next, and leave the project building and passing its checks after every slice. After each slice, report briefly what changed, how it was verified and what is next. This keeps the user able to stop at any point with a working project.

**5. Release verdict.** Run the release checklist from the `deployment-readiness` skill, then give the final report: ready, ready with conditions, or not ready, with what was done, what remains and how to roll back.

## Priorities when goals conflict

Security, then data integrity, then correctness, then compatibility with existing clients, then performance, then polish. A security item is never downgraded to make a roadmap look shorter.

## Where to stop and ask

Wait for explicit approval before: migrations or anything that deletes or rewrites data; changes to authentication, CORS, CSP or cookie behaviour; breaking an API contract; large refactors, architecture changes or new infrastructure; anything that needs a secret rotated; deploying or touching production. Outside these, proceed within the approved roadmap without asking for each step.

Do not respond to a half-built project by rewriting it. Keep what works and improve it incrementally unless the user decides otherwise with the trade-off in front of them.

## Evidence

Findings cite files and lines. Distinguish what you verified (read in code, ran and observed) from what you are inferring, and never report a check as passed that was not run. Do not print secret values or open real env files; names and locations are enough. If a lens turned up nothing, say that instead of padding the report.

## Long engagements

This work often outlives one session. Once a roadmap is approved, offer to keep it in a file in the repository (for example `docs/production-readiness.md`) with item status, and update it after each slice, so the work can be resumed without redoing the audit.

Report formats for the roadmap, slice updates and the final report are in [references/templates.md](references/templates.md).

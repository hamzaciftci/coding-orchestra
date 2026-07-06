---
name: fullstack-delivery
description: Take a project from current state to production-ready - audit, feature inventory, tech-debt, roadmap, frontend-backend contract check, release checklist. Use for finish this project or make production ready tasks.
trigger: /fullstack-delivery
---

# FULLSTACK_PROJECT_DELIVERY_SKILL

## Purpose
Take a project from its current state and bring it **end-to-end to production-ready**: identify gaps, surface technical debt, build a roadmap, guarantee frontend-backend alignment, and get it ready for release.

Use cases:
- "Finish this project / get it live / bring it to production quality" tasks
- Taking over and completing half-finished projects
- End-to-end delivery of large feature sets (DB → API → UI)
- Project health check and roadmap generation

## Role
**Product-minded Senior Full-Stack Engineer / Delivery Lead.** An engineer who sees both code quality and user value; who distinguishes what is MVP from what is nice-to-have; who actually "finishes" the project. Deliberately strikes the balance between technical perfectionism and the delivery deadline.

## Working Principles
1. **Full inventory first, work second.** Don't start anything without knowing what the project is, what it promises, and where it falls short.
2. **User-flow-driven verification.** "Code exists" ≠ "feature works". Every flow is tested end-to-end (sign up → use → sign out).
3. **The contract is the single source of truth.** What the frontend expects and what the backend returns must be the same; if a discrepancy is found, the contract is clarified and both sides conform to it.
4. **Prioritization is ruthless:** Blocker (release blocker) → Critical (causes problems in the first week) → Major → Minor → Polish.
5. **Every session ends in a working state.** No handing off half-finished refactors or a broken build.
6. **Make invisible work visible:** technical debt, missing tests, and security holes are listed in the report; never swept under the rug.

## Workflow
### Phase 1 — Discovery and Analysis
1. Read the README, package.json, config, folder structure, and any documentation.
2. Derive the project's purpose and target user flows (if unclear, confirm the list with the user).
3. Tech stack inventory: framework versions, DB, auth, deployment target.
4. Run build + typecheck + lint + test; record existing breakages.

### Phase 2 — Audit
5. **Feature inventory:** a table of existing / partial / missing features.
6. **Frontend/backend alignment check:** match every fetch/API call to a real endpoint; list field-name, type, and status-code mismatches.
7. **API contract check:** are response formats consistent, is the error format standardized?
8. **Database schema check:** are the schema ↔ ORM model ↔ TypeScript types in sync; are there missing indexes/constraints/relations?
9. **User flows:** sign up, sign in, password reset, main CRUD flows, payment (if any) — does each one work end-to-end?
10. **Error scenarios:** what happens on network error, invalid input, unauthorized access, and empty-data states?
11. **Admin panel check:** are admin routes protected, can basic management tasks be performed?
12. **Public API check:** are externally exposed endpoints documented and protected?
13. **SEO/PWA/performance quick scan:** metadata, sitemap, robots, baseline Lighthouse scores, manifest (if PWA is targeted).
14. **Security quick scan:** with the critical items from /security-audit (auth, IDOR, secret, validation).

### Phase 3 — Planning
15. Turn all findings into a prioritized **roadmap**: Blocker → Critical → Major → Minor → Polish.
16. For each item: impact, estimated scope, dependencies. Present the plan to the user (get approval on large work).

### Phase 4 — Implementation
17. Start with the Blockers; make each fix in a safe order (read→analyze→plan→small change→test→report).
18. Make changes as vertical slices: fully finish one feature as DB→API→UI→test, then move to the next.
19. At the end of each slice, build + test are green.

### Phase 5 — Release Preparation
20. Apply the /deployment-readiness checklist.
21. Complete the **Production release checklist** (below).
22. Final report + list of remaining work.

## Audit Templates

### Feature Inventory Table
| Feature | Status (✅/🟡/❌) | End-to-end tested | Notes |
|---|---|---|---|

### Frontend/Backend Alignment Matrix
| Frontend call | Endpoint | Method | Contract match | Auth match | Issue |
|---|---|---|---|---|---|

### Technical Debt Log
| Debt | Location | Risk | Priority | Estimated effort |
|---|---|---|---|---|

### Production Release Checklist
- [ ] All Blocker/Critical items closed
- [ ] `build`, `typecheck`, `lint`, `test` green
- [ ] All main user flows verified end-to-end (sign up/sign in/CRUD/payment)
- [ ] Error scenarios shown properly to the user
- [ ] Env variables defined in the prod environment, `.env.example` up to date
- [ ] DB migrations applicable to prod; rollback plan exists
- [ ] Auth + authorization + admin protection verified
- [ ] SEO: metadata, sitemap, robots; PWA (if targeted): manifest + icons
- [ ] Error monitoring + logging active
- [ ] Performance acceptable (Lighthouse/basic load check)
- [ ] Remaining known issues delivered in writing

## How Should the AI Behave?
- Don't rush to write code; the value of this skill lies in the honesty of the audit in Phases 1-2.
- Neither exaggerate nor soften the audit findings — back them with evidence (file:line).
- Don't make large scope decisions (dropping a feature, architectural change) on your own; present your recommendation with its rationale.
- Give an interim report after each vertical slice; a consolidated final report at the end.
- Before saying "done", genuinely verify every item of the release checklist.

## Critical Warnings
- ⚠️ On a half-finished project, the "let's rewrite everything from scratch" reflex is forbidden; preserve existing working value, improve incrementally.
- ⚠️ A contract change is not made without updating both sides.
- ⚠️ Operations touching the prod database (migration, seed) are not run without approval.
- ⚠️ Security items in the roadmap are never demoted to "Polish" level.

## Safe Order to Follow When Changing Code
1. **Read first** — all layers of the relevant vertical slice (schema, API, UI).
2. **Then analyze** — contract, flow, dependencies.
3. **Then plan** — the slice's steps and risks.
4. **Then make a small change** — layer by layer, compilable at each step.
5. **Then test** — end-to-end flow + error scenarios.
6. **Then report.**

## Do
- ✅ Always start work with a full project audit; fill in the inventory tables.
- ✅ Produce a prioritized roadmap and get approval for large decisions.
- ✅ Finish features end-to-end as vertical slices.
- ✅ Test every flow through real users' eyes (happy path + error + unauthorized).
- ✅ Deliver technical debt and remaining risks in writing.
- ✅ Apply the full checklist before release.

## Don't
- ❌ Skip the analysis phase and jump straight into coding.
- ❌ Mark half-finished features as "working".
- ❌ Show the frontend as "done" with mock data and leave the backend connection for later.
- ❌ Patch a contract mismatch with a hack on just one side.
- ❌ Risk a working structure with a big-bang refactor.
- ❌ Defer security and error scenarios to after release.
- ❌ Check off an untested release checklist item.

## Checklist
At the end of every work session:
- [ ] Are build/typecheck/lint/test green?
- [ ] Does the slice finished in this session work end-to-end?
- [ ] Was the roadmap updated (finished/new items)?
- [ ] Were contract changes applied on both sides?
- [ ] If new technical debt was created, was it recorded?
- [ ] Was an interim report given?

## Reporting Format
1. **Analysis performed** (audit summaries + inventory tables)
2. **Problems found** (with priority classes)
3. **Changes made** (per slice)
4. **Files touched**
5. **Why this solution** (roadmap rationale)
6. **Security impact**
7. **Performance impact**
8. **Test result** (end-to-end results per flow)
9. **Remaining risks** (open roadmap items + technical debt)
10. **Next recommendations** (prioritized)

## Usage Prompt
```
Load and apply the /fullstack-delivery rules.
Task: Analyze this project, produce a feature inventory + alignment matrix + technical debt log,
present a prioritized roadmap, and after my approval, starting from the Blockers, bring the project
to production-ready. Give an interim report after each slice, and a final report with the release checklist at the end.
```

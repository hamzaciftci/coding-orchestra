# Engagement templates

Use the parts that fit the project. An empty table adds nothing; leave out sections with no content and say so in one line.

## Contents

- [Priority scale](#priority-scale)
- [Audit report and roadmap](#audit-report-and-roadmap)
- [Slice update](#slice-update)
- [Final report](#final-report)

## Priority scale

| Level | Meaning |
|---|---|
| Blocker | The product cannot be released: a core flow is broken, the build fails, or data or money is exposed to anyone. |
| Critical | Will cause an incident soon after launch: exploitable with a normal account, data loss under ordinary use, a failure with no way to recover. |
| Major | Real users will hit it, with a workaround or limited damage. |
| Minor | Rough edges and small debts. |
| Polish | Would make the product feel more finished. |

## Audit report and roadmap

```markdown
# Production readiness audit — <project> @ <commit>

## Summary
<What the product does, the stack, and the overall state in three or four sentences.>

Baseline checks: install <ok/fail>, typecheck <…>, lint <…>, tests <n passed / n failed / none>, build <…>.

## Feature inventory
| Feature | State | Works end to end | Notes |
|---|---|---|---|
| Sign up and sign in | Complete / Partial / Missing | Verified / Not verified / Broken | |

## Frontend–backend contract
| Client call | Endpoint | Match | Issue |
|---|---|---|---|
| `lib/api.ts:42` createOrder | POST /api/orders | Mismatch | client sends `qty`, server expects `quantity` |

## Findings
| # | Priority | Area | Finding | Evidence | Confidence |
|---|---|---|---|---|---|
| 1 | Blocker | Security | Orders readable by any logged-in user | app/api/orders/[id]/route.ts:10 | Confirmed |

<Detail for Blocker and Critical items: what, impact, proposed fix, size.>

## Roadmap
1. <item> — <why first> — <S/M/L>
2. …

## Decisions needed from you
<Scope questions, approvals for gated changes, things only you can do (rotate keys, confirm dashboard settings).>

## Not covered
<What could not be checked from the repository.>
```

## Slice update

```markdown
### Slice: <name> (roadmap #<n>)
- **Changed:** <what, in which files>
- **Verified:** <commands run and results; what was checked by hand>
- **Not verified:** <and why>
- **Side effects or follow-ups:** <contract changes, new env vars, migrations pending approval>
- **Next:** <next slice>
```

## Final report

```markdown
# Production readiness — <project> @ <commit>

**Verdict:** Ready | Ready with conditions | Not ready
<Reason in two or three sentences.>

## Status by area
| Area | Status | Notes |
|---|---|---|
| Security | Good / Conditions / Blocked | |
| Backend | | |
| Data | | |
| Frontend | | |
| Tests | | |
| Deployment | | |

## What was done
<By slice, briefly.>

## Security findings closed
| Finding | Severity | Fix | Verified |
|---|---|---|---|

## Still open
<Accepted risks and remaining roadmap items, with priority.>

## For you to do
<Rotations, dashboard checks, approvals.>

## Release checklist and smoke result
<From the deployment-readiness skill.>

## Rollback
<How, and what it does not undo.>
```

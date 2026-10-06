# Security report template

Use this shape for the final report. Keep each finding short enough to act on; the reader should not need the rest of the report to understand one finding.

```markdown
# Security audit — <project>

Scope: <what was reviewed, at which commit>. Mode: <audit only | audit and fix>.

## Summary

| # | Finding | Severity | Location | Confidence | Status |
|---|---------|----------|----------|------------|--------|
| 1 | Orders readable by any logged-in user | Critical | app/api/orders/[id]/route.ts:10 | Confirmed | Fixed |
| 2 | RLS not visible for `profiles` | High | supabase/ (no policy found) | Needs verification | Open |

## Findings

### 1. <title>

- **What:** one or two sentences describing the flaw.
- **Severity:** Critical | High | Medium | Low, and the reason for that level.
- **Location:** `path:line` for each place involved.
- **How it could be abused:** the scenario in plain terms: who the attacker is, what they send, what they get. No ready-to-run exploit.
- **Fix:** what was changed, or what is proposed if not applied.
- **Why this closes it:** the defensive reasoning.
- **Residual risk:** what remains, or "none known".
- **How to verify:** the test or request sequence that shows the hole is closed and the normal path still works. State whether it was run.

## Actions only you can take

- Rotate <VARIABLE_NAME> (exposed in <location>). Removing it from the code does not undo the exposure.
- Confirm <dashboard setting>.

## Not covered

What was out of scope or could not be checked from the repository, and why.
```

Status values: **Fixed** (applied and verified), **Fixed, unverified** (applied, check not run), **Proposed** (awaiting approval), **Open** (reported only).

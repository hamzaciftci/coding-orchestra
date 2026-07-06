---
name: bug-fix-refactor
description: Root-cause bug fixing and safe refactoring - reproduce, isolate root cause, minimal change, no big rewrites, regression guard, behavior-preserving refactor. Use to fix a bug or refactor code without breaking behavior.
trigger: /bug-fix-refactor
---

# BUG_FIXING_AND_REFACTOR_SKILL

## Purpose
Fix bugs at their **root cause** and improve code safely **without changing its behavior**. Work without suppressing symptoms, without unnecessary large rewrites, and without introducing regressions.

Use cases:
- "This bug is happening, fix it" tasks
- Unstable/flaky behavior, edge-case bugs
- Safe refactoring of complex/hard-to-read code
- Fixing performance regressions

## Role
**Senior Engineer / Debugging & Refactoring Specialist.** An engineer who never touches code before understanding it; who reproduces and proves the bug; who makes minimal, targeted, and reversible changes; and who guarantees behavior equivalence with tests when refactoring.

## Working Principles
1. **Reproduce first, then fix.** You cannot claim to have "fixed" a bug you cannot reproduce.
2. **Root cause, not symptom.** Silencing with `try/catch`, sprinkling `?.`, or escaping with `if (x) return` is not a solution.
3. **Minimal change.** The smallest diff that solves the problem. Do not mix unrelated improvements into the same change.
4. **Rewrite as a last resort.** A large rewrite only when it is genuinely required and with an explicit rationale; the default is incremental improvement.
5. **Refactor = behavior held constant.** A refactor does not change inputs/outputs/side effects; it only improves the internal structure. Prove this with tests.
6. **Hunt regressions in advance.** Check all callers and edge cases of the function you are changing.

## Workflow
### Bug Fixing
1. **Reproduce the bug:** Determine the steps, input, and environment; if possible, write a failing test/scenario (red).
2. **Observe:** Collect the actual error message, stack trace, and logs; gather evidence, not assumptions.
3. **Root cause analysis:** Precisely isolate the condition that produces the bug (5 Whys / binary search / adding logs).
4. **Side-effect analysis:** Who calls this code, and who depends on this behavior?
5. **Plan the minimal fix.**
6. **Apply it** (small diff).
7. **Verify:** Did the red scenario turn green; are the other related scenarios still working (regression)?
8. **Report.**

### Refactor
1. **Document current behavior:** Existing tests if any; otherwise write a characterization (golden) test first.
2. **Clarify the goal:** Readability, performance, or reducing duplication? Limit the scope.
3. **Transform in small steps:** Tests green at every step; each step a single logical improvement.
4. **Verify behavior equivalence:** Same output/side effects for the same inputs.
5. **If there is a performance claim, measure:** Compare before/after; do not argue by guesswork.
6. **Report.**

## Standards
- **Evidence culture:** Every step is grounded in observation; no commit based on "I think it was here".
- **Test first when possible:** Leave a test that locks in the fix (regression guard).
- **Readability improvement:** Clarify naming, remove dead code, break a complex expression into a meaningful intermediate variable — but without changing behavior.
- **Performance:** Target the real bottleneck (N+1, unnecessary copies, heavy synchronous work); do not ruin readability with micro-optimizations.
- **Small commit/diff:** Each diff carries a single purpose; a mixed diff cannot be reviewed and cannot be reverted.

## How Should the AI Behave?
- Do not proceed to apply a fix without reproducing the bug or proving its root cause.
- Do not say "it was probably this" and change multiple places at once; one hypothesis, one change, one verification.
- Before starting a refactor, make sure there is a safety net (test) that preserves the current behavior; if not, write it first.
- Stop before expanding the scope; write additional improvements in the "Next suggestions" section of the report, do not apply them without permission.
- Always perform the regression check after the change and report its result.

## Critical Warnings
- ⚠️ "Patches" that hide the bug (empty catch, unnecessary optional chaining, silenced lint) produce new and more insidious bugs.
- ⚠️ Refactoring without tests is blind; do not change a large structure without at least one characterization test.
- ⚠️ "Let me fix this too while I'm at it" scope creep is the number one cause of regressions.
- ⚠️ A performance "improvement" is not claimed without being measured.

## Safe Order to Follow When Changing Code
1. **Read first** — the buggy code + callers + tests if any.
2. **Then analyze** — root cause + impact area + regression surface.
3. **Then plan** — minimal fix / stepwise refactor.
4. **Then make a small change** — a single hypothesis / a single step.
5. **Then test** — red→green + regression + (in a refactor) behavior equivalence.
6. **Then report.**

## To Do
- ✅ Reproduce the bug first, and lock it down with a failing test if possible.
- ✅ Isolate and prove the root cause.
- ✅ Make the smallest targeted change.
- ✅ Write a behavior-preserving test before refactoring.
- ✅ Verify regression + behavior equivalence after the change.
- ✅ Leave a regression test that locks in the fix.

## Not To Do
- ❌ Applying a blind fix without reproducing the bug.
- ❌ Suppressing the symptom and leaving the root cause.
- ❌ An unnecessary large rewrite for a small bug.
- ❌ (Silently) changing behavior during a refactor.
- ❌ Mixing unrelated changes into the same diff.
- ❌ Claiming performance gains without measuring.
- ❌ "Solving" a lint/type error by silencing it.

## Checklist
- [ ] Bug reproduced (or explained why it could not be reproduced)
- [ ] Root cause proven (file:line)
- [ ] Change is minimal and single-purpose
- [ ] Callers/impact area checked
- [ ] Red→green verification done
- [ ] Regression tests passed
- [ ] (Refactor) behavior equivalence verified
- [ ] Test protecting the fix added

## Reporting Format
1. **Analysis performed** (reproduction steps + root cause)
2. **Problems found** (root cause + contributing factors)
3. **Changes made** (minimal diff summary)
4. **Files touched**
5. **Why this solution** (why minimal, why not a rewrite)
6. **Security impact**
7. **Performance impact** (before/after if measured)
8. **Test result** (red→green + regression)
9. **Remaining risks**
10. **Next suggestions** (improvements you left out of scope)

## Usage Prompt
```
Load and apply the /bug-fix-refactor rules.
Task: [Write the bug / refactor goal]
First reproduce the bug and prove its root cause; apply the minimal fix; verify regression.
If it is a refactor, first write a behavior-preserving test, then transform in small steps and prove behavior equivalence.
```

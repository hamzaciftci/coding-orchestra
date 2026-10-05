# Results — v2.0.0, measured 2026-10-05

What was measured while rewriting v1 into v2, including the places where v2 did not win. How each test works is described in [README.md](README.md). Raw selection answers are in `results/2026-10-05/trigger/`; per-run audit grades are in `results/2026-10-05/audit.json`.

## Summary

| Question | Result |
|---|---|
| Does the set follow the Agent Skills spec and stay in sync across languages? | Yes. `validate.mjs` passes for 7 English and 7 Turkish skills. |
| Is less context loaded? | When a skill triggers, 57–86% less up front. Nothing is loaded for general coding or bug-fix requests. The always-on listing got larger, and a skill plus all of its references can exceed the old single file. |
| Does the right skill get picked? | In the selection proxy: 31–32 of 32 in-scope requests, and no skill loaded on any of 14 out-of-scope requests. v1 loaded a skill on 4–6 of those 14. |
| Does an audit find more? | On Sonnet, no: every condition found all 30 seeded flaws, with or without a skill. On Haiku, yes for stack-specific flaws (8.3 of 12 on average against 3.5 for both v1 and no skill) and no for standard classes, where v1 was at least as good. |
| Does it cost fewer tokens to run the audit? | No. Total tokens per run were about the same as v1. |

## 1. Structure

`node evals/validate.mjs` → `14 skills checked (7 en, 7 tr): 0 error(s), 0 warning(s)`.

`claude plugin validate .` and `claude plugin validate ./locales/tr` pass, including with `--strict` for the marketplace manifest.

## 2. Context footprint

`node evals/context-cost.mjs` (English, estimated tokens):

| | v1.1.0 | v2.0.0 | change |
|---|---:|---:|---:|
| Skills | 11 | 7 | |
| Always-on listing (all skills) | 661 | 814 | +23% |
| SKILL.md body, mean | 2457 | 886 | -64% |
| SKILL.md body, largest | 3737 | 1193 | -68% |
| All SKILL.md bodies | 27027 | 6201 | -77% |
| Reference files (on demand) | 0 | 16633 | |

| Request | v1 loads | v2, body only | v2, body + all its references |
|---|---:|---:|---:|
| Unrelated coding task, when v1's base skill triggers | 2298 | 0 | 0 |
| Fix a bug, when v1's bug-fix skill triggers | 1640 | 0 | 0 |
| Security audit | 2763 | 1193 (-57%) | 4314 (+56%) |
| Add an API endpoint | 3737 | 815 (-78%) | 3280 (-12%) |
| Write a migration | 2509 | 872 (-65%) | 3527 (+41%) |
| Polish a UI | 5623 | 798 (-86%) | 3385 (-40%) |
| Pre-deploy check | 2338 | 757 (-68%) | 3444 (+47%) |
| Full delivery, every skill and reference | 27027 | 2750 (-90%) | 22834 (-16%) |

Reading this honestly:

- The listing that sits in every session grew, because descriptions now state when to use a skill as well as what it does. In Turkish the estimate is +59% (878 → 1397). That is the price of the selection behaviour in section 3.
- A skill that reads all of its references costs more than the v1 file it replaces in three of five single-skill cases. The saving depends on tasks not needing every reference, which was not measured.
- The clear saving is in what no longer loads: the body is a third of the size, and requests that used to pull in `general-coding` or `bug-fix-refactor` now load nothing.

## 3. Skill selection

One batched call per cell; 46 requests (32 in scope, 14 out of scope).

| Listing | Model | Matches the version's own design | Right skill on in-scope | Skill loaded on out-of-scope |
|---|---|---:|---:|---:|
| v1 English | Haiku | 46/46 | 32/32 | 6/14 |
| v1 English | Sonnet | 46/46 | 32/32 | 4/14 |
| v2 English | Haiku | 46/46 | 32/32 | 0/14 |
| v2 English | Sonnet | 45/46 | 31/32 | 0/14 |
| v2 Turkish | Haiku | 46/46 | 32/32 | 0/14 |
| v2 Turkish | Sonnet | 46/46 | 32/32 | 0/14 |

- v1 did what it was designed to do; its design was to load a skill for bug fixes, refactors and generic coding. Those are the 4–6 loads in the last column.
- v1 had two overlapping orchestrators. For the four whole-project requests Sonnet chose `fullstack-delivery` every time and Haiku split them evenly. v2 has one.
- The single v2 miss: Sonnet loaded nothing for "hydration mismatch error on the navbar", where `frontend-engineering` was expected.
- Turkish descriptions selected as well as English ones, for both Turkish and English requests.

Limits: a proxy, not the real harness; one run per cell; requests and labels written by the skill author.

## 4. Audit benchmark

Task: "Audit the project for security problems before we launch. Don't change any code, just report." Fixture: `fixtures/leaky-shop`, 30 seeded flaws (18 standard, 12 stack-specific). Each report was read and graded against the key by hand.

### Sonnet

| Condition | Runs | Standard (18) | Stack-specific (12) | Total tokens per run |
|---|---:|---:|---:|---:|
| No skill | 2 | 18, 18 | 12, 12 | 78k, 81k |
| v1 skill | 2 | 18, 18 | 12, 12 | 92k, 90k |
| v2 skill (first draft) | 2 | 18, 18 | 12, 12 | 90k, 92k |

A capable model finds everything in a project this size with no help. Neither skill changed recall, and both cost about 12% more tokens than no skill. What differed was the report: both v2 reports labelled every finding Confirmed or Needs verification, listed the actions only the owner can take, said what was not covered, and flagged the React Server Components advisory. The no-skill and v1 reports each did two to four of those five things.

### Haiku

| Condition | Runs | Standard (18) | Stack-specific (12) | Total (30) | Mean |
|---|---:|---|---|---|---:|
| No skill | 2 | 15, 17 | 3, 4 | 18, 21 | 19.5 |
| v1 skill | 2 | 18, 18 | 4, 3 | 22, 21 | 21.5 |
| v2, first draft | 2 | 14, 16 | 6, 8 | 20, 24 | 22.0 |
| v2, second draft | 2 | 15, 18 | 5, 10 | 20, 28 | 24.0 |
| **v2.0.0 as shipped** | 3 | 18, 17, 17 | 6, 10, 9 | 24, 27, 26 | **25.7** |

Tokens per run were 59k–78k without a skill, 74k–76k with v1 and 72k–76k with v2.

What the drafts taught:

- **First draft.** Stack-specific recall doubled, but standard-class recall fell below v1. Both runs missed the XSS sink and the cookie flags, and one missed the service-role key and CORS. v1's long category list was doing real work for a small model, and the first inventory script only listed entry points, so anything outside a route got less attention.
- **Second draft.** The script gained a section for SQL tables and their row level security state and a list of patterns worth a look anywhere in the code; `SKILL.md` gained one paragraph listing what to sweep outside the entry points. One run reached 28; the other ignored most of the script output and scored 20.
- **Shipped.** One more sentence asks the agent to account for every line of the script output before writing the report. All three runs landed between 24 and 27.

Still missed by v2 on Haiku, as runs that found each: the middleware matcher gap (0 of 3), `archiveProject` checking the session but not ownership (1 of 3), webhook idempotency (1 of 3), the `Bearer undefined` cron check and the unverified `getSession()` (2 of 3 each). v1 remains slightly ahead on standard classes (18.0 against 17.3).

Other observations from reading the reports: one v1 Haiku report marked three vulnerable endpoints as "(Protected)" and invented a CSRF finding against Server Actions; v1 Haiku reports included ready-to-send payloads and long replacement code. v2 reports were shorter per finding and kept to the eight-field format in six of seven Haiku runs.

A third second-draft run scored 16 + 9 = 25 but was given an extra formatting instruction by mistake, so it is left out of the table.

## What these results do not show

- **Small samples.** Two or three runs per cell. The Haiku spread within one condition (20 to 28) is as large as the gap between conditions. The direction on stack-specific flaws was consistent across seven v2 runs against four baseline runs; the size of the effect is uncertain.
- **One fixture, written by the skill author.** Several seeded flaws match patterns the inventory script looks for, so part of the Haiku gain is the script finding what it was built to find. A fixture written independently would be a fairer test.
- **Only `security-audit` has an output benchmark.** The other six skills were validated structurally and through the selection test only.
- **Not run in the real harnesses.** Reports came from Claude subagents told to read the skill file, not from skills installed in Claude Code. Plugin installation was validated by manifest only. Nothing was run in Codex: the local CLI was too old for the current model catalogue, so Codex discovery (`.agents/skills`) and `agents/openai.yaml` follow the documentation but are untested.
- **Small project.** Twenty-eight files fit in one context window. The inventory script should matter more in a repository too large to read whole; that was not tested.

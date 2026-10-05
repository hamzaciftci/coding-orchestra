# Evals

Tools for checking that a change to the skills is an improvement and not only a rewrite. Everything runs on Node 18+ with no dependencies. Recorded results are in [RESULTS.md](RESULTS.md).

| What | Command | Needs a model? |
|---|---|---|
| Structure, spec compliance, size budgets, links, EN/TR parity, manifests | `node evals/validate.mjs` | no |
| Context footprint, v1 vs current | `node evals/context-cost.mjs [--lang tr]` | no |
| Skill selection from descriptions | `evals/trigger/` | yes |
| Audit quality on seeded flaws | `evals/audit/` | yes |

## validate.mjs

Fails on anything that would stop a skill loading in a compliant agent or would let the two languages drift: non-spec frontmatter keys, a name that does not match its folder, an over-long description, a `SKILL.md` over budget, a reference or script that `SKILL.md` never mentions, broken links, files that differ in structure between English and Turkish, scripts that are not byte-identical, and manifest or version mismatches. Run it before every commit.

## context-cost.mjs

Compares what a session has to carry with v1 (read from the `v1.1.0` git tag) and with the current tree, split by when the cost is paid: the always-on listing, the body loaded when a skill triggers, and references loaded on demand. Token counts are character-based estimates; use them to compare, not to bill.

## trigger/

Does the agent pick the right skill from the descriptions alone, and does it stay quiet when no skill applies?

- `queries.json`: 46 requests in English and Turkish. 32 should activate a skill; 14 are out of scope, including near misses (a bug fix, a refactor, a CI workflow, a React Native feature).
- `prompt.mjs` prints a prompt containing one version's skill listing and all requests.
- `score.mjs` scores the JSON a model returns.

```bash
node evals/trigger/prompt.mjs --version v2 --lang en > prompt.txt
# give prompt.txt to a model, save its JSON reply as answers.json
node evals/trigger/score.mjs --version v2 answers.json
```

This is a proxy. It isolates the descriptions from everything else in a real session and asks about all requests in one call. It is good for comparing two sets of descriptions and for catching a description that steals requests from its neighbour; it does not predict absolute trigger rates in a given agent. Each version is scored against its own design (v1 intended `general-coding` to load on any coding task), and the last column counts how often a skill loads on requests the current design says need none.

## audit/

Does a skill make an audit find more, and does it report better?

- `fixtures/leaky-shop/` is a small Next.js + Prisma + Supabase + Stripe project with 30 seeded flaws. It contains no real credentials and is never built or run.
- `audit/answers.json` lists the flaws in two tiers: 18 standard classes (SQL injection, missing auth, XSS) and 12 that need knowledge of this stack (a cron check that passes with `Bearer undefined`, a `startsWith("/")` redirect guard, roles read from `user_metadata`, a table with no row level security). It also lists five report qualities, such as separating confirmed findings from unverified ones.
- `audit/run.mjs` runs the task under one condition (`none`, `v1` or `v2`) with a logged-in `codex` or `claude` CLI and saves the report. The fixture is copied outside the repository first so the agent cannot read the answer key, and the skill under test is handed over as a file, so skills installed on the machine do not interfere.
- `audit/grade.mjs` scores saved reports by keyword patterns.

```bash
node evals/audit/run.mjs --agent claude --condition none --model haiku --tag 1
node evals/audit/run.mjs --agent claude --condition v2 --model haiku --tag 1
node evals/audit/grade.mjs evals/results/local/*.md --missed
```

Keyword grading is cheap and repeatable but only shows that a report mentions a flaw. Read a sample of reports too; the recorded results were graded by reading each report against the key.

Run each condition at least three times. Variance between runs of a small model is larger than the difference between conditions on a single run.

`run.mjs` could not be exercised end to end in the environment where these skills were developed (the `claude` CLI there was not logged in and the installed `codex` CLI was too old for its model catalogue), so the recorded results were produced by running the same task and prompts through subagents instead. Treat the runner as a starting point and check its first output by hand.

## Known limits

- One fixture, written by the same author as the skills and the inventory script. Several seeded flaws correspond to patterns the script looks for. A second fixture written by someone else would be a fairer test.
- Small samples. See RESULTS.md for exact run counts.
- No benchmark yet for the other six skills beyond validation and the selection test.

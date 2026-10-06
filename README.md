<p align="center">
  <img src=".github/social-preview.png" alt="Coding Orchestra — Agent Skills for shipping production web apps" width="100%">
</p>

# 🎻 Coding Orchestra

**Seven Agent Skills that help a coding agent take a Next.js / serverless web app to production. They work in [Claude Code](https://claude.com/claude-code), [Codex](https://developers.openai.com/codex) and any other agent that reads the open [Agent Skills](https://agentskills.io) format.**

[![Release](https://img.shields.io/github/v/release/hamzaciftci/coding-orchestra?color=6E56CF)](https://github.com/hamzaciftci/coding-orchestra/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-7-6E56CF)](#the-skills)
[![Languages](https://img.shields.io/badge/skills-EN%20%2B%20TR-blue)](#install)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-D97757)](https://agentskills.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 🇹🇷 Türkçe için → [README.tr.md](README.tr.md) · Coming from v1 (11 skills)? → [Upgrading from v1](#upgrading-from-v1)

Current models already know general engineering practice. What they lack on a real project is the knowledge specific to the stack and the job: how Server Actions, Supabase row level security or Vercel cron fail in production, where to stop and ask before touching something irreversible, what a useful audit report looks like. These skills provide that knowledge, and nothing else, and they load only when the task needs them.

---

## Quick start

**Claude Code** (plugin):

```
/plugin marketplace add hamzaciftci/coding-orchestra
/plugin install coding-orchestra@coding-orchestra
```

**Claude Code or Codex** (installer script):

```bash
git clone https://github.com/hamzaciftci/coding-orchestra.git
cd coding-orchestra
./install.sh --agent all        # Windows: ./install.ps1 -Agent all
```

Then describe the work:

```
Check this app for security holes before we launch. Report only, don't change code.
```

The agent picks `security-audit` from its description. Other install options, including Turkish and project-scoped installs, are under [Install](#install).

---

## The skills

| Skill | Use it when | What it adds |
|---|---|---|
| `production-delivery` | You want a whole project audited, finished or made production-ready | An audit across six lenses (in parallel when the agent supports subagents), a prioritized roadmap, an approval gate, fixes in verified vertical slices and a final go / no-go report |
| `security-audit` | You want vulnerabilities found or closed in an app you own | An inventory script for routes, Server Actions, cron, middleware coverage and row level security; Next.js, Supabase, Prisma and Stripe pitfalls; an 8-field finding format with confidence labels |
| `deployment-readiness` | You are about to deploy, a production build fails, or a deployment needs verifying | An env-variable inventory script (names only, never values), Vercel / serverless / edge pitfalls, a release checklist with evidence, a smoke-check script |
| `backend-engineering` | You add or change an endpoint, Server Action, webhook, cron job, auth or payment flow | A definition of done for server code and the places where serverless differs from a long-running server |
| `database-api-design` | You change a schema, write a migration or change an API contract | Staged expand/contract recipes, lock-safe DDL, Prisma and Supabase traps, compatibility rules |
| `frontend-engineering` | You build UI, or an interface needs to look and feel professional | A definition of done for UI, App Router notes, a polish review method |
| `testing-qa` | You add tests, plan QA or verify a fix | A risk-first test plan, an authorization matrix, how to test webhooks, cron and Server Actions for real |

Written for **Next.js (App Router) · React · TypeScript · Tailwind · Node serverless · PostgreSQL / Supabase / Prisma · Vercel · Stripe**. The method in each skill carries over to other stacks; the reference detail does not.

`production-delivery` works on its own and goes deeper when the other six are installed. There is deliberately no skill for general coding or bug fixing: current models do that well without one, and a skill that claims every coding task costs context on all of them.

Security work is defensive. The skills are for auditing and fixing systems you own or are authorized to assess, and they tell the agent not to write weaponized exploits or probe third-party hosts.

---

## Usage

Describe the work; the agent matches it to a skill's description:

```
Audit this project end to end and give me a roadmap. Don't change code until I approve the scope.
We deploy on Friday. What blocks the release?
Rename users.fullname to display_name without downtime.
Add tests for the checkout flow, starting with whatever is most likely to break.
```

Or call a skill by name:

| Agent | Explicit call |
|---|---|
| Claude Code (installer or manual install) | `/security-audit` |
| Claude Code (plugin) | `/coding-orchestra:security-audit` |
| Codex | `$security-audit`, or pick it from `/skills` |

The helper scripts also run on their own, with Node 18+ and no dependencies:

```bash
node skills/security-audit/scripts/attack-surface.mjs path/to/project
node skills/deployment-readiness/scripts/env-inventory.mjs path/to/project
node skills/deployment-readiness/scripts/smoke.mjs https://staging.example.com / /login /api/health
```

---

## Built to the Anthropic and OpenAI guidance

v2 follows the published guidance for Agent Skills from both vendors, so the same folder works unchanged in both agents:

| Guidance | How Coding Orchestra applies it |
|---|---|
| Use only the fields defined by the Agent Skills specification | Frontmatter is limited to `name`, `description`, `license`, `compatibility` and `metadata`. The non-standard `trigger:` field from v1 is gone. |
| The description is written in the third person and says what the skill does **and when to use it**, since that is all the agent sees before the skill loads | Every description names its scope, then a "Use when…" clause. Out-of-scope requests (bug fixes, refactors, CI) are left for the agent to handle without a skill. |
| Keep `SKILL.md` concise (well under 500 lines); move detail into files that load only when needed (progressive disclosure), one level deep | Each `SKILL.md` is under 60 lines. Stack-specific detail lives in `references/`, linked directly from `SKILL.md`. |
| Explain the reasoning instead of stacking rigid rules, and leave the method to the model | Skills describe the outcome, the boundaries and the judgment calls, with reasons. No all-caps MUST lists. |
| Use scripts for deterministic, repeatable work | Inventory and smoke-check scripts in `scripts/`, run by the agent and readable on their own. |
| Codex reads optional display metadata from `agents/openai.yaml` | Each skill ships one with a display name, short description and default prompt. |
| Put always-on project rules in `AGENTS.md` (Codex) or `CLAUDE.md` (Claude Code), not in a skill | A six-line [working agreement](templates/AGENTS.md) covers scope, approval points, secret handling and honest reporting. |
| Evaluate skills instead of assuming they help | [`evals/`](evals/) holds a validator, a context-cost comparison, a selection test and a seeded-flaw audit benchmark. |

Anatomy of one skill:

```
skills/security-audit/
├── SKILL.md              # ~50 lines: outcome, approach, boundaries, judgment calls
├── references/           # loaded only when the task needs them
│   ├── stack-pitfalls.md
│   └── report-template.md
├── scripts/
│   └── attack-surface.mjs
└── agents/openai.yaml    # display metadata for Codex
```

---

## Results

Measured on 2026-10-05 against v1; full numbers and their limits are in [`evals/RESULTS.md`](evals/RESULTS.md).

- **Less context.** When a skill triggers, its body is 57–86% smaller than the v1 file it replaces, and general coding or bug-fix requests now load nothing. The always-on skill listing grew by 23%, because descriptions now say when to use each skill.
- **Better selection.** The right skill was picked for 31–32 of 32 in-scope requests, and no skill loaded on any of 14 out-of-scope requests (v1 loaded one on 4–6 of them).
- **Audit recall depends on the model.** On Sonnet every condition, with or without a skill, found all 30 seeded flaws; what improved was the report. On Haiku, v2 found 25.7 of 30 on average against 21.5 for v1 and 19.5 with no skill, mostly on stack-specific flaws.
- **Not cheaper to run.** Tokens per audit were about the same as v1.

Samples are small (two or three runs per cell), the benchmark fixture was written by the skills' author, and nothing has been run inside Codex yet.

---

## Install

English is the default. Each route has a Turkish variant.

### Claude Code plugin

```
/plugin marketplace add hamzaciftci/coding-orchestra
/plugin install coding-orchestra@coding-orchestra       # English
/plugin install coding-orchestra-tr@coding-orchestra    # Turkish
```

Claude Code asks for an install scope (user, project or local). Plugin skills are namespaced: `/coding-orchestra:security-audit`, `/coding-orchestra-tr:security-audit`.

### Installer script (Claude Code, Codex or both)

```bash
./install.sh                     # Claude Code, English -> ~/.claude/skills
./install.sh --agent codex       # Codex                -> ~/.agents/skills
./install.sh --agent all --tr    # both, Turkish
```

Windows PowerShell: `./install.ps1`, `./install.ps1 -Agent codex`, `./install.ps1 -Agent all -Tr`.

| Flag (sh / ps1) | Effect |
|---|---|
| `--agent claude\|codex\|all` / `-Agent` | Which agent's skills directory to install into (default `claude`) |
| `--lang en\|tr`, `--en`, `--tr` / `-Lang`, `-En`, `-Tr` | Language (default `en`) |
| `--project` / `-Project` | Install into the current project (`.claude/skills`, `.agents/skills`) so teammates get the skills from the repo |
| `--dir PATH` / `-Dir PATH` | Install into the project at `PATH` |
| `--skill NAME` / `-Skill a,b` | Install only the named skills |
| `--prune-legacy` / `-PruneLegacy` | Remove v1 skills that no longer exist |
| `--force` / `-Force` | Replace a same-named skill that did not come from Coding Orchestra |
| `--dry-run` / `-DryRun` | Show what would happen without changing anything |

The installer only replaces Coding Orchestra skills. A different skill with the same name is left alone unless you pass `--force`.

### Manual

Copy any skill folder into the directory your agent scans. Each folder is self-contained.

```bash
cp -r skills/security-audit ~/.claude/skills/     # Claude Code
cp -r skills/security-audit ~/.agents/skills/     # Codex
```

Turkish skills are in `locales/tr/skills/`. Both languages use the same skill names, so install one language per location.

### Optional: the working agreement

Skills load on demand. For the few rules you want in every session, copy the section in [`templates/AGENTS.md`](templates/AGENTS.md) into your project's `AGENTS.md` (Codex and others) or `CLAUDE.md` (Claude Code). Turkish: [`locales/tr/templates/AGENTS.md`](locales/tr/templates/AGENTS.md).

Claude Code and Codex both pick up newly installed skills on their own. If a skill does not show up, run `/reload-plugins` after a plugin install in Claude Code, or start a new session.

---

## Upgrading from v1

v1 was eleven long rulebooks written for models that needed step-by-step management. v2 keeps what still changes behaviour and drops the rest.

| v1 skill | v2 |
|---|---|
| `production-delivery` | `production-delivery` (rewritten) |
| `fullstack-delivery` | merged into `production-delivery` |
| `ui-ux-polish` | merged into `frontend-engineering` (polish review) |
| `security-audit`, `backend-engineering`, `database-api-design`, `deployment-readiness`, `frontend-engineering`, `testing-qa` | same names, rewritten |
| `general-coding` | retired; replaced by the [working agreement](templates/AGENTS.md) |
| `bug-fix-refactor` | retired; current models do this without a skill |

Other breaking changes:

- English moved to `skills/` and is now the installer default. Turkish moved to `locales/tr/skills/`; pass `--tr` to install it.
- The `trigger:` frontmatter field was removed.

To upgrade an existing install and remove the retired skills:

```bash
git pull
./install.sh --prune-legacy          # add --tr to keep Turkish; Windows: ./install.ps1 -PruneLegacy
```

---

## Repository layout

```
coding-orchestra/
├── skills/                  # English skills (also the Claude Code plugin's skills)
├── locales/tr/              # Turkish skills, plugin manifest and working agreement
├── templates/AGENTS.md      # optional always-on working agreement
├── .claude-plugin/          # plugin and marketplace manifests
├── evals/                   # validator, context cost, selection test, audit benchmark
├── install.sh, install.ps1
└── README.md, README.tr.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: add knowledge the model does not already have, keep `SKILL.md` lean, change English and Turkish together, and run `node evals/validate.mjs` before every commit.

## License

[MIT](LICENSE) © Hamza Çiftçi.

---

<sub>Not affiliated with Anthropic or OpenAI. "Claude" and "Claude Code" are trademarks of Anthropic; "Codex" is a trademark of OpenAI.</sub>

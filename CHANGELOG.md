# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [2.0.0] — 2026-10-05

A redesign for current models and for the Agent Skills standard. See the README for the
reasoning and `evals/RESULTS.md` for measurements.

### Changed
- **Eleven skills became seven.** `fullstack-delivery` merged into `production-delivery`;
  `ui-ux-polish` merged into `frontend-engineering`. Every remaining skill was rewritten:
  a short `SKILL.md` (outcome, boundaries, judgment calls) plus reference files that load
  on demand.
- **Portable format.** Frontmatter uses only Agent Skills specification fields; the
  non-standard `trigger:` field is gone. Each skill ships `agents/openai.yaml` for Codex.
- **Layout.** English skills live in `skills/` and are the default; Turkish skills moved
  to `locales/tr/skills/`. Both sets have identical structure and scripts.
- **Installers** take `--agent claude|codex|all`, install into `~/.claude/skills` or
  `~/.agents/skills` (or a project), replace skills cleanly, refuse to overwrite a
  same-named skill from elsewhere without `--force`, and can remove retired v1 skills
  with `--prune-legacy`. The default language is now English.

### Added
- Helper scripts (Node 18+, no dependencies): `attack-surface.mjs` (entry points,
  middleware coverage, cron, row level security, risky patterns), `env-inventory.mjs`
  (variable names only, never values) and `smoke.mjs` (post-deploy GET checks).
- Claude Code plugin and marketplace manifests (`coding-orchestra`, `coding-orchestra-tr`).
- `templates/AGENTS.md`: an optional six-line working agreement for `AGENTS.md` / `CLAUDE.md`.
- `evals/`: validator (spec, size budgets, links, EN/TR parity), context-cost comparison,
  skill-selection test and a seeded-flaw audit benchmark with recorded results.

### Removed
- `general-coding` and `bug-fix-refactor`. Current models follow this practice without a
  skill, and a skill that claims every coding task costs context on all of them. The
  working agreement template covers the rules worth keeping always on.

## [1.1.0] — 2026-07-06

### Added
- **English skill set** (`skills-en/`) — full English translations of all 11 skills,
  alongside the Turkish originals in `skills/`.
- Language selection in the installers: `--en` / `-En` (English) and `--tr` /
  `-Lang tr` (Turkish, default).

### Changed
- READMEs (EN + TR) document both language sets and the new installer flags.

## [1.0.0] — 2026-07-06

### Added
- Initial public release. 🎻
- 11 professional software-engineering skills for Claude Code:
  - `general-coding`, `backend-engineering`, `frontend-engineering`,
    `fullstack-delivery`, `security-audit`, `bug-fix-refactor`,
    `database-api-design`, `deployment-readiness`, `ui-ux-polish`,
    `testing-qa`, and the `production-delivery` master orchestrator.
- Cross-platform installers (`install.sh`, `install.ps1`) supporting global,
  project-scoped, and custom install targets.
- English and Turkish READMEs, MIT license, and contribution guide.

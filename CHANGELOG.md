# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

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

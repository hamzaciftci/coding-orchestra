# 🎻 Coding Orchestra

**A battle-tested collection of 11 professional software-engineering skills for [Claude Code](https://claude.com/claude-code).**

Turn Claude into a disciplined senior engineering team. Each skill encodes the working principles of a specific expert role — backend architect, security auditor, QA engineer, product designer — plus a master orchestrator that runs an entire project from analysis to production-ready delivery.

> 🇹🇷 Türkçe okumak için → [README.tr.md](README.tr.md)
> 📝 The skill files themselves are written in **Turkish**. Claude applies them regardless of the language you prompt in. English translations are a welcome contribution — see [CONTRIBUTING](CONTRIBUTING.md).

---

## Why?

Out of the box, an AI assistant will happily write code before understanding your project, skip auth checks, swallow errors silently, and claim "done" without testing. **Coding Orchestra** installs a set of skills that force a professional discipline instead:

- **Read → Analyze → Plan → Small change → Test → Report** on every edit
- Security, data integrity and edge-cases treated as first-class, not afterthoughts
- Honest reporting — "I verified in code" vs "I'm assuming", never fake test results
- Minimal, reversible changes — no unrequested rewrites

Built for modern web stacks: **Next.js · React · TypeScript · Tailwind CSS · Node.js · serverless · PostgreSQL / Supabase / Prisma · Vercel.**

---

## The 11 Skills

| Slash command | Role | What it does |
|---|---|---|
| `/general-coding` | Senior Engineer / Tech Lead | Base engineering discipline for any task |
| `/backend-engineering` | Backend Architect | APIs, auth, IDOR, validation, transactions, webhooks, cron, caching |
| `/frontend-engineering` | Frontend Lead | Components, state, forms, loading/empty/error states, a11y, performance |
| `/fullstack-delivery` | Delivery Lead | Audit, feature inventory, tech-debt, roadmap, release checklist |
| `/security-audit` | AppSec Engineer | Find + fix vulnerabilities with a per-issue report |
| `/bug-fix-refactor` | Debug/Refactor Specialist | Root-cause fixing & behavior-preserving refactor |
| `/database-api-design` | Data & API Architect | Schema, indexes, safe migrations, contracts, compatibility |
| `/deployment-readiness` | Release Manager | Build gate, env/secrets, serverless, monitoring, release checklist |
| `/ui-ux-polish` | Product Designer + Design Eng | Amateur → professional SaaS quality |
| `/testing-qa` | QA / SDET | Test pyramid, security regression, smoke tests |
| `/production-delivery` | **Master Orchestrator** | Runs all skills across an 11-phase end-to-end delivery |

Each skill follows the same structure: **Purpose · Role · Working Principles · Workflow · Standards · How the AI should behave · Critical warnings · Safe change order · Do / Don't · Checklist · Reporting format · Ready-to-use prompt.**

---

## Installation

### Quick install (recommended)

**macOS / Linux:**
```bash
git clone https://github.com/hamzaciftci/coding-orchestra.git
cd coding-orchestra
./install.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/hamzaciftci/coding-orchestra.git
cd coding-orchestra
./install.ps1
```

The installer copies every skill into your personal Claude Code skills folder (`~/.claude/skills/`), so they're available in **all** your projects.

### Manual install

Copy each folder from `skills/` into `~/.claude/skills/`:

```bash
cp -r skills/* ~/.claude/skills/
```

Or install a single skill:
```bash
cp -r skills/security-audit ~/.claude/skills/
```

### Project-scoped install

To ship the skills with a specific project only (so your teammates get them via the repo), copy into that project's `.claude/skills/` instead of the global folder.

> **After installing, restart Claude Code** so it re-scans the skills directory. Then type `/` to see them, or just describe your task and Claude will pick the right skill automatically.

---

## Usage

### Run the full end-to-end delivery
```
/production-delivery
Take this project through the full 11-phase flow and make it production-ready.
First run the Phase 1–9 audits and give me a prioritized roadmap; after my approval,
apply changes in vertical slices with an interim report after each, then a final report.
```

### Target a single concern
```
/security-audit        → find and close all Critical/High vulnerabilities
/frontend-engineering  → bring the UI up to professional standard
/deployment-readiness  → get this project ready to go live
/bug-fix-refactor      → fix this bug at its root cause and add a regression test
/database-api-design   → design the schema + API contract for this feature
```

### Audit-only (no code changes)
```
/production-delivery
Run Phases 1–9 only. Change no code — just give me a prioritized findings + roadmap report.
```

You don't even have to type the slash command — describe the work ("audit this project for security holes") and Claude will trigger the matching skill from its description.

---

## How it works

Claude Code discovers skills as folders containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: security-audit
description: When to use this skill...
trigger: /security-audit
---

# ... the full expert instructions ...
```

The `description` tells Claude *when* to reach for the skill; the body tells it *how* to behave once engaged. The `/production-delivery` orchestrator references the other skills by phase, applying a conflict-priority order: **Security > Data integrity > Correctness > Compatibility > Performance > Polish.**

---

## Repository structure

```
coding-orchestra/
├── skills/
│   ├── general-coding/SKILL.md
│   ├── backend-engineering/SKILL.md
│   ├── ... (11 skills total)
│   └── production-delivery/SKILL.md
├── install.sh          # macOS / Linux installer
├── install.ps1         # Windows installer
├── README.md
├── README.tr.md        # Turkish
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE             # MIT
```

---

## Contributing

Contributions are very welcome — new skills, improvements, and especially **English translations** of the existing Turkish skills. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Hamza Çiftçi. Use it freely, including commercially. Attribution appreciated but not required.

---

<sub>Not affiliated with Anthropic. "Claude" and "Claude Code" are trademarks of Anthropic.</sub>

# Contributing to Coding Orchestra

Thanks for wanting to make this better! 🎻

## Ways to contribute

- **New skills** — a well-scoped expert role that isn't covered yet.
- **Improvements** — sharpen an existing skill's rules, checklists, or reporting format.
- **English translations** — the skills are currently written in Turkish. High-quality English versions are the most-wanted contribution.
- **Bug reports & ideas** — open an issue.

## Skill format

Every skill lives in its own folder as `skills/<name>/SKILL.md` and starts with YAML frontmatter:

```markdown
---
name: my-skill              # kebab-case, must match the folder name
description: One or two sentences describing WHEN Claude should use this skill.
trigger: /my-skill          # the slash command
---

# MY_SKILL

## Amaç / Purpose
...
```

Keep the section structure consistent with the existing skills:

> Amaç · Rol · Çalışma Prensipleri · İş Akışı · Standartlar · AI Nasıl Davranmalı · Kritik Uyarılar · Kod Değiştirirken Uygulanacak Güvenli Sıra · Yapılacaklar · Yapılmayacaklar · Kontrol Listesi · Raporlama Formatı · Kullanım Promptu

### Guidelines

- `name` must be lowercase kebab-case and **match the folder name exactly**.
- Write `description` as a *when to use* trigger — this is what Claude matches against.
- Save `SKILL.md` as **UTF-8 without BOM** (a BOM can break frontmatter parsing).
- Keep skills stack-relevant (Next.js / React / TypeScript / Tailwind / Node / serverless / Postgres-Supabase-Prisma / Vercel) unless proposing a deliberately general one.
- If your skill orchestrates others (like `production-delivery`), reference them by their `/slash` names.

## Development flow

1. Fork the repo and create a branch: `git checkout -b add-my-skill`.
2. Add or edit files under `skills/`.
3. Test locally: run `./install.sh` (or `./install.ps1`), restart Claude Code, and confirm the skill triggers and behaves as intended.
4. Commit with a clear message and open a pull request describing what the skill does and why.

## Code of conduct

Be respectful and constructive. Assume good intent. That's it.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

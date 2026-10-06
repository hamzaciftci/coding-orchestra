# Contributing to Coding Orchestra

Thanks for wanting to make this better. 🎻

## What makes a good contribution

A skill earns its place by changing what an agent does. Before adding a line, ask: would a current model get this wrong without it? If not, leave it out. Good material is:

- **Stack-specific knowledge** that is easy to get wrong: a framework default that changed, a platform limit, a library trap.
- **Boundaries**: what needs the user's approval, what must never be printed or run.
- **Deliverable shapes**: report formats and checklists that make results comparable.
- **Scripts** for work that should be done the same way every time.

General engineering advice ("write clean code", "handle errors") does not belong here; models already have it.

## Skill format

Skills follow the [Agent Skills specification](https://agentskills.io/specification). Each one is a folder:

```
skills/<name>/
├── SKILL.md              # required
├── references/*.md       # detail loaded on demand
├── scripts/*.mjs         # Node 18+, no dependencies, read-only by default
└── agents/openai.yaml    # display name, short description, default prompt (Codex)
```

`SKILL.md` frontmatter:

```yaml
---
name: my-skill              # lowercase, hyphens, must match the folder name
description: What the skill does, in the third person. Use when <the situations that should trigger it>.
license: MIT
compatibility: Requirements and the stack it is written for.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---
```

Rules the validator enforces:

- Only specification fields in frontmatter. No tool-specific keys (`allowed-tools` aside), so every agent can load the file.
- `description` under 1024 characters, saying both what and when.
- `SKILL.md` body under 120 lines; reference files under 200 lines, with a contents section past 100.
- Every reference and script is mentioned in `SKILL.md`; reference files do not link to other files.
- UTF-8 without BOM, LF line endings.

Style:

- Explain why. A reason generalizes; a bare rule does not. Avoid all-caps directives.
- Describe the outcome and the constraints, and leave the method to the model unless a fixed procedure really is required.
- Say when to read each reference file.
- Follow the project's conventions first: a skill should tell the agent to prefer what the codebase already does.

## English and Turkish

`skills/` (English) is the source of truth. `locales/tr/skills/` mirrors it file for file: the same headings, code blocks, tables and links, with prose translated. Scripts are identical in both; after changing one, run:

```bash
node evals/sync-scripts.mjs
```

A change to an English skill should come with the matching Turkish change. If you cannot write Turkish, say so in the pull request and someone will help.

## Checking your change

```bash
node evals/validate.mjs        # must pass
node evals/context-cost.mjs    # see what your change costs in context
```

If you changed a description, rerun the trigger test; if you changed `security-audit`, rerun the audit benchmark. Both are described in [`evals/README.md`](evals/README.md). A change that makes a skill longer should come with evidence that it makes results better.

Scripts must never read or print secret values, write outside a path the user gave, or send requests other than the ones the user asked for.

## Pull requests

1. Fork and branch.
2. Make the change in both languages and run the validator.
3. Describe what behaviour the change is meant to produce and how you checked it.

## Code of conduct

Be respectful and constructive. Assume good intent.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).

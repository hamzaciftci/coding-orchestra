# Working agreement

<!--
Optional always-on guidance from Coding Orchestra. Copy the section below into your
project's AGENTS.md (read by Codex and other agents) or CLAUDE.md (read by Claude Code).
It is deliberately short: it covers what an agent cannot infer from the code, which is
how you want risk, scope and reporting handled. Edit it to match your project.
-->

## How to work in this repository

- Follow the conventions already in the code (structure, naming, error handling, test style) over your own defaults.
- Keep changes scoped to what was asked. Mention unrelated problems you notice; do not fix them in the same change.
- When goals conflict, the order is: security, data integrity, correctness, compatibility with existing clients, performance, polish.
- Ask before doing anything that is hard to undo or reaches outside this repository: database migrations and data deletion, changes to authentication or CORS/CSP behaviour, breaking an API contract, adding infrastructure or a major dependency, deploying, or anything touching production.
- Never print, log or commit secret values, and do not open real env files. Refer to secrets by variable name. A leaked secret needs rotating by a human; removing it from code is not a fix.
- After a change, run the project's checks (typecheck, lint, tests, build) and report the real result. Say what you verified, what you inferred and what you did not test.

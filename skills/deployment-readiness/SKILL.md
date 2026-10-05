---
name: deployment-readiness
description: Checks whether a web project is ready to ship and closes the gaps, covering the build gate, environment variables, Vercel, serverless and edge runtime fit, database connections and migrations, cron and webhooks, monitoring, a release checklist and a post-deploy smoke test. Use when the user wants to deploy, go live, launch or prepare a release, when a production build or deployment is failing, or when a finished deployment needs verifying.
license: MIT
compatibility: Helper scripts need Node.js 18+. Platform notes are written for Next.js on Vercel with PostgreSQL (Supabase, Prisma); the method applies to other serverless hosts.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Deployment readiness

The deliverable is a go / no-go verdict the user can trust, with the evidence behind it, plus fixes for whatever blocks a release. "It builds on my machine" and "it works in production" are separated by a known set of differences; most of this skill is about those.

## Boundaries

- Prepare the release; do not perform it unless the user explicitly asks in this conversation. Deploying, running migrations against a production database and changing platform environment variables affect live users, so present the exact commands and a rollback path and let the user decide.
- Never print, log or copy secret values. Variable names and "set / missing" are all a report needs. Do not open real env files; the inventory script below works from source code and the example file.
- Do not get a green build by hiding errors: no `ignoreBuildErrors`, no `ignoreDuringBuilds`, no blanket `@ts-ignore`, no skipped tests. If one of these is already in the project, that is a finding.

## Approach

1. **Run the project's own gates** in the order it defines them (typically install, typecheck, lint, test, build) and record real output. Fix root causes of failures.
2. **Inventory configuration.** From this skill's directory:

   ```
   node scripts/env-inventory.mjs <project-dir>
   ```

   It reports variables the code reads but the example file does not document, public-prefixed names that look like secrets, env files tracked by git, and whether startup validation exists.
3. **Check production fit.** Read [references/production-pitfalls.md](references/production-pitfalls.md) and look for each failure mode in the code. These are the things that pass local development and break on the platform: runtime mismatches, connection exhaustion, in-memory state, cron paths, caching defaults, migration commands.
4. **Work through** [references/release-checklist.md](references/release-checklist.md). Every item gets a status and the evidence for it.
5. **After a deployment exists** (preview or production), verify it:

   ```
   node scripts/smoke.mjs https://<deployment-url> / /login /api/health
   ```

   GET requests only. It reports status, timing and which security headers are present. Follow it with the critical user flow by hand or with the project's end-to-end tests.

## Giving the verdict

State one of **Ready**, **Ready with conditions** or **Not ready**, then the reasons.

Much of production readiness cannot be seen from a repository: whether variables are set on the platform, whether cron actually fires, whether error tracking receives events, whether the database has backups. List these as items for the user to confirm, with where to look. Do not tick them on assumption, and do not call a release verified when the smoke test was not run against the real deployment.

Always include the rollback path. On most platforms rolling back the code is instant and rolling back the database is not, so say which migrations in this release are not backward compatible with the previous code.

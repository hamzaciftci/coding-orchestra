---
name: deployment-readiness
description: Ship a project to production safely - build gate, env and secret checks, Vercel serverless edge compatibility, monitoring, health checks, security headers, SEO PWA, release checklist, smoke test. Use to prepare deploy or go live.
trigger: /deployment-readiness
---

# DEPLOYMENT_AND_PRODUCTION_READINESS_SKILL

## Purpose
Ship a project to production in a **safe, error-free, and observable** way: resolve build/config issues, ensure serverless/edge compatibility, complete monitoring/health/SEO/PWA readiness, and pass the release checklist.

Use cases:
- "Prepare this project for production / Vercel" tasks
- Resolving build/runtime errors that surface during deploy
- Final pre-production check (release readiness)
- Post-deploy smoke test and verification

## Role
**Senior DevOps-minded Full-Stack Engineer / Release Manager.** Experienced in Vercel/serverless deployment, Node runtime compatibility, environment management, and production observability; the engineer who closes the gap between "it worked on my machine" and "it works in production."

## Working Principles
1. **The build is sacred.** No deploy without a green build; even warnings get reviewed.
2. **Prod ≠ local.** Env, runtime, timeouts, file system, and connection behavior differ; verify accordingly.
3. **Fail-fast config.** A missing/wrong env variable must blow up at startup with a clear error, not fail silently.
4. **No production without observability.** Error tracking + logs + health check are mandatory.
5. **Rollback plan ready.** Every release has a known rollback path (revert/redeploy).
6. **Zero secret leakage.** The client bundle and public env are audited rigorously.

## Workflow
1. **Understand the environment:** Deploy target (Vercel?), Node version, framework version, edge vs serverless usage.
2. **Get a clean build:** `install → typecheck → lint → test → build` in order; record and resolve every error.
3. **Env inventory:** Which env vars does the code read? Is `.env.example` up to date? Are they all defined in prod? `NEXT_PUBLIC_` audit.
4. **Runtime compatibility:** Node APIs that don't run on edge, serverless timeouts, connection pooling, file system usage.
5. **Cron / webhook / background:** Are they triggered in prod, and are they protected?
6. **Monitoring/health/SEO/PWA:** set up and verify.
7. **Release checklist:** complete it.
8. **Post-deploy smoke test:** verify critical flows live.
9. **Report.**

## Standards (Mandatory Scope)

### Build Errors
- `next build` fully green; if type and lint errors halt the build, they get genuinely fixed (not silenced).
- Dynamic/static render warnings are understood (misplaced `dynamic`/`revalidate` usage is corrected).
- Bundle size is reasonable; unexpectedly large chunks get investigated.

### Environment Checks
- All variables are validated with Zod via a centralized `env.ts`; fail-fast if missing.
- Server-only secrets are NOT `NEXT_PUBLIC_`; leakage is prevented with the `server-only` package.
- `.env.example` is up to date (key names, descriptions, no values); prod env is defined on the platform.

### Vercel / Serverless / Edge Compatibility
- **Edge runtime:** No Node-only APIs (fs, net, some crypto, Buffer-dependent packages); use edge only for suitable work.
- **Serverless function:** work exceeding the timeout limit (plan-based) is queued; avoid heavy global init to protect cold start.
- **DB connection:** pooling on serverless (Supabase pooler / PgBouncer / Prisma Accelerate/Data Proxy); global singleton client.
- Don't rely on in-memory state (rate limit, cache, session in an external store).

### Node Version & Dependency
- Node version compatible with prod via `engines` / `.nvmrc`; lockfile committed and consistent.
- `npm audit` critical/high vulnerabilities; unused/duplicate dependencies cleaned up.
- Peer dependency warnings and version conflicts resolved.

### Lint / Typecheck / Test
- All four green in CI (or manually locally); a mandatory gate before deploy.

### Production Logging & Error Monitoring
- Error tracking (Sentry, etc.) active in prod; unhandled rejection/exception captured; source maps uploaded (but not leaked publicly).
- Structured logs; sensitive data masking; noise/spam log cleanup.

### Health Check & API Timeout
- `/api/health`: DB + critical dependency check; used after deploy and in uptime monitoring.
- Timeout (AbortController) + retry on external calls; hanging requests must not exhaust the function timeout.

### Cron Checks
- `vercel.json` cron definitions correct; the cron endpoint protected with `CRON_SECRET`; jobs idempotent.
- Verify after deploy that crons are actually triggered.

### Cache Invalidation
- Clear `revalidate`/`revalidateTag`/`revalidatePath` strategy; no stale content left after deploy; user-specific data doesn't land in the CDN (`private`/`no-store`).

### SEO / PWA / Robots / Sitemap
- Metadata (title/description/OG) on all pages; `sitemap.ts` + `robots.ts` correct (index allowed in prod, disallowed in staging).
- If targeting PWA: `manifest`, icons, service worker behavior (aggressive cache must not produce stale content).
- Canonical URL, language/locale settings.

### Security Headers
- CSP, HSTS, `X-Content-Type-Options`, `frame-ancestors`/`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` applied via `next.config`/middleware and verified in prod.

### Release Checklist
- [ ] `install/typecheck/lint/test/build` green
- [ ] All prod env variables defined; `.env.example` up to date; no secret leakage
- [ ] Node version + lockfile compatible; `npm audit` no critical issues
- [ ] Edge/serverless runtime compatibility verified; DB pooling configured
- [ ] DB migration applicable to prod + rollback plan
- [ ] Cron/webhook protected and triggered
- [ ] Error monitoring + logging + health check active
- [ ] Security headers + cookie flags applied
- [ ] SEO (metadata/sitemap/robots) + PWA (if any) ready
- [ ] Cache invalidation strategy verified
- [ ] Post-deploy smoke test (critical flows) passed
- [ ] Rollback path known

### Post-Deploy Smoke Test
- Home page + critical pages return 200.
- Signup/login, main CRUD flow, payment (if any) work end-to-end live.
- Health check green; no burst of errors in logs after deploy.

## How Should the AI Behave?
- Don't go to deploy on "it probably works"; run a full local build + checklist first.
- Don't get past a build error by silencing it (ignore flags, piles of `// @ts-ignore`); fix the root cause.
- Never write env/secrets in plain text to logs or reports; only state the "defined/missing" status.
- Don't perform operations that touch prod (migration, env change) without approval; present a plan + rollback.
- Don't say "shipped live, no issues" without running a post-deploy smoke test.

## Critical Warnings
- ⚠️ Hiding errors with `ignoreBuildErrors` / `ignoreDuringBuilds` is an invitation to disaster.
- ⚠️ Using Node-only packages in the edge runtime blows up in prod (may not show in local dev).
- ⚠️ Opening a new DB connection on every request on serverless leads to connection exhaustion.
- ⚠️ An open cron/webhook endpoint is a critical security hole.
- ⚠️ A prod migration may not be reversible — back up + rollback plan first.
- ⚠️ A leaked secret is rotated first; deleting it alone is not enough.

## Safe Order to Follow When Changing Code
1. **Read first** — config (`next.config`, `vercel.json`), env usage, runtime markers.
2. **Then analyze** — build/runtime/compatibility risks.
3. **Then plan** — fixes + migration + rollback.
4. **Then make small changes** — one at a time, building at each step.
5. **Then test** — full build + (if possible) preview deploy + smoke test.
6. **Then report.**

## To Do
- ✅ Enforce a fully green `typecheck/lint/test/build` gate.
- ✅ Validate env with Zod, update `.env.example`, audit for secret leakage.
- ✅ Verify edge/serverless compatibility and DB pooling.
- ✅ Check cron/webhook protection and triggering.
- ✅ Set up monitoring + health check + security headers.
- ✅ Run a post-deploy smoke test and define the rollback path.

## Not To Do
- ❌ Hide build errors with an ignore flag.
- ❌ Put a secret in `NEXT_PUBLIC_`/the client bundle or write it to logs.
- ❌ Use Node-only APIs on edge.
- ❌ Access the DB without connection pooling on serverless.
- ❌ Leave an open cron/webhook endpoint.
- ❌ Run a prod migration without a backup/rollback.
- ❌ Say "shipped live, no issues" without running a smoke test.

## Checklist
- [ ] `install/typecheck/lint/test/build` green
- [ ] Env validation + `.env.example` + secret audit done
- [ ] Runtime compatibility (edge/serverless) + DB pooling correct
- [ ] Cron/webhook protected and working
- [ ] Monitoring/log/health active
- [ ] Security headers + SEO + PWA (if any) ready
- [ ] Migration + rollback plan ready
- [ ] Post-deploy smoke test passed

## Reporting Format
1. **Analysis performed** (environment, runtime, build status)
2. **Problems found** (build/config/runtime/security)
3. **Changes made**
4. **Files touched**
5. **Why this solution**
6. **Security impact** (secrets, headers, endpoint protection)
7. **Performance impact** (cold start, bundle, cache)
8. **Test results** (build + smoke test)
9. **Remaining risks** (rollback note, metrics to watch)
10. **Next recommendations**

## Usage Prompt
```
Load and apply the /deployment-readiness rules.
Task: Prepare this project for production. Run the full build gate, perform the env/secret/runtime/cron/monitoring
checks, and complete the release checklist. For operations that touch prod, present a plan + rollback first.
Deliver a final report with post-deploy smoke test results.
```

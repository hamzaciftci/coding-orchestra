# Release checklist and report

Give every item a status and its evidence. Statuses: **Pass** (checked, with evidence), **Fail** (blocks or should block the release), **Confirm** (cannot be seen from the repository; the user must check, say where), **N/A**.

## Checklist

| Area | Item | Status | Evidence |
|---|---|---|---|
| Build | Install, typecheck, lint, tests and build all pass with no error-suppression flags | | command output |
| Build | Node version pinned, lockfile committed, Prisma client generated during build | | |
| Config | Every variable the code reads is documented in the example file | | env-inventory output |
| Config | No secret behind a public prefix, no env file tracked by git | | env-inventory output |
| Config | Variables validated at startup | | file |
| Config | Production variables set on the platform for the right environments | Confirm | platform dashboard |
| Runtime | No Node-only APIs in edge routes or middleware | | |
| Runtime | Long work is queued or has a deliberate max duration; no reliance on in-memory state or local files | | |
| Data | Application uses a pooled connection; client created once per instance | | |
| Data | Migrations apply with the production command; order relative to deploy is safe | | |
| Data | Backup or point-in-time recovery available before destructive migrations | Confirm | provider dashboard |
| Jobs | Cron paths match routes; cron and webhook endpoints verify their secret or signature | | attack-surface output or code |
| Jobs | Production webhook endpoints and secrets registered with providers | Confirm | provider dashboard |
| Security | No open Critical or High findings (see the `security-audit` skill) | | |
| Security | Security headers and cookie flags set | | smoke output or config |
| Observability | Error tracking wired for server and client; health endpoint exists | | |
| Observability | Events actually arriving in the tracker | Confirm | tracker dashboard |
| Content | Metadata, robots and sitemap correct for production; staging not indexable | | |
| Caching | No per-user data in shared caches; mutations invalidate what they change | | |
| Verification | Smoke check and critical user flow pass on the deployed URL | | smoke output |
| Rollback | Rollback action known; migrations that break the previous build identified | | |

## Report

```markdown
# Release readiness — <project> @ <commit>

**Verdict:** Ready | Ready with conditions | Not ready

<Two or three sentences: what decides the verdict.>

## Blocking
- <item> — <evidence> — <fix or owner>

## Fixed in this pass
- <what changed and how it was verified>

## For you to confirm
- <what, where to look>

## Checklist
<the table above, filled in>

## Rollback
<how to roll back code; which migrations are not backward compatible; what rollback does not undo>

## After launch
<what to watch in the first hours: error rate, function duration, connection count, cron runs>
```

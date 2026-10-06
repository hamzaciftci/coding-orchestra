# What works locally and fails in production

Written for Next.js on Vercel with PostgreSQL. Platform limits and defaults change between plans and framework versions, so where a number matters, read the project's config and the platform's current documentation instead of trusting a remembered value.

## Contents

- [Build](#build)
- [Environment variables](#environment-variables)
- [Runtime: serverless and edge](#runtime-serverless-and-edge)
- [Database connections](#database-connections)
- [Migrations](#migrations)
- [Cron, webhooks and background work](#cron-webhooks-and-background-work)
- [Caching](#caching)
- [Observability](#observability)
- [Search engines and staging](#search-engines-and-staging)
- [Rollback](#rollback)

## Build

- `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` in the Next config make the build pass while shipping broken code. Remove them and fix what surfaces.
- The Prisma client must be generated on the build machine. Platforms cache `node_modules`, so without `prisma generate` in `postinstall` or the build script, production runs a stale client that does not match the schema.
- Local builds read `.env.local`; the platform does not. A build that needs a variable at build time (anything public-prefixed, anything read during static generation) fails or bakes in `undefined` if it is not set for that environment.
- Pin the Node version (`engines` in package.json or `.nvmrc`) and commit the lockfile, otherwise the platform picks its own default.
- Case-sensitive file systems: an import that differs from the file name only by case works on macOS and Windows and fails on Linux builders.

## Environment variables

- Public-prefixed variables (`NEXT_PUBLIC_`) are inlined at build time. Changing one on the platform has no effect until the next build, and a secret given that prefix is published to every visitor.
- Platforms scope variables per environment (production, preview, development). A variable set only for production leaves preview deployments broken, and the reverse ships a preview value to production.
- Without validation at startup, a missing variable shows up as a runtime error on the first request that needs it, possibly days later on a rarely used path. Validating `process.env` against a schema at boot turns that into a failed deployment.
- Fallbacks such as `process.env.SECRET || "dev"` hide a missing variable and are worse than a crash.

## Runtime: serverless and edge

- The edge runtime is not Node. `fs`, `net`, `child_process`, most native modules and many database drivers do not exist there. A route with `export const runtime = "edge"` that imports any of them can work in `next dev` and fail when deployed. Middleware has historically run on the edge runtime; check what the installed Next version does.
- Functions have a maximum duration that depends on plan and configuration. Work that can exceed it (exports, bulk email, long LLM calls) belongs in a queue or background job, or needs `maxDuration` raised deliberately.
- The file system is read-only apart from a temporary directory that is not shared between invocations. Files written there are gone on the next request.
- Module-level state (a `Map` cache, a rate-limit counter, an in-memory session store) is per instance and disappears on cold start. Anything that must be shared lives in an external store.
- Work started after the response is returned may be frozen or killed. Use the framework's `after()` or the platform's `waitUntil` for post-response work.
- Streaming and large responses are subject to payload limits; file uploads through a function hit the request body limit, so large uploads go directly to storage with a signed URL.

## Database connections

- Each function instance opens its own connections. Without a pooler, a traffic spike exhausts PostgreSQL's connection limit and every request fails. Use the provider's pooled connection string (Supabase's pooler, PgBouncer, Prisma Accelerate, Neon's pooled endpoint) for the application.
- With Prisma behind a transaction-mode pooler, the pooled URL needs `pgbouncer=true`, and migrations need a direct connection (`directUrl`), because they use features the pooler does not support.
- Create the client once per instance. `new PrismaClient()` inside a request handler, or in a module that hot-reloads without the `globalThis` guard, leaks connections.
- Interactive transactions hold a connection for their whole duration; keep network calls out of them.

## Migrations

- Production uses `prisma migrate deploy` (or the provider's equivalent that applies committed migration files). `prisma migrate dev` and `prisma db push` are development tools: they can reset data or change the schema without a migration history.
- Decide when migrations run relative to the deployment. If they run before the new code is live, the old code must work with the new schema; if after, the new code must tolerate the old schema. A column rename or drop in one step breaks whichever side runs second. See the `database-api-design` skill for the expand/contract sequence.
- Take a backup or confirm point-in-time recovery before a migration that drops or rewrites data.

## Cron, webhooks and background work

- Each `path` in `vercel.json` crons must match an existing route exactly. A typo means the job silently never runs.
- Cron schedules are in UTC, run only against the production deployment, and may be limited in frequency by plan.
- Cron routes are public URLs. The handler has to check `Authorization: Bearer <CRON_SECRET>`, and the variable has to be set, or anyone can trigger it.
- Webhook endpoints need the production signing secret, which differs from the test-mode secret, and the endpoint URL has to be registered with the provider for the production domain.
- Jobs and webhook handlers run more than once in practice. Check they are idempotent before the first real retry proves they are not.

## Caching

- Caching defaults have changed across Next.js major versions (for `fetch`, GET route handlers and the client router cache). Read the behaviour for the installed version instead of assuming.
- A statically rendered or cached page that contains per-user data serves one user's data to everyone. Anything personalized needs dynamic rendering or `private` / `no-store` cache headers.
- Every cache needs a named invalidation path (`revalidateTag`, `revalidatePath`, a TTL). Check that mutations call it.
- A service worker with aggressive caching keeps serving the old build after a deploy.

## Observability

- Error tracking should be wired for both server and client, with source maps uploaded to the tracker and not served publicly.
- A health endpoint that checks the database and critical dependencies gives the smoke test and uptime monitoring something to call.
- Logs should be structured and free of tokens, passwords and personal data.
- Unhandled promise rejections in route handlers surface only in function logs. Find out where those logs are before launch.

## Search engines and staging

- `robots.ts` and `sitemap.ts` should describe the production domain. A staging site on a custom domain is indexable unless it is blocked; platform preview URLs are usually marked noindex automatically, custom domains are not.
- Metadata: every public page has a title and description, and the `metadataBase` is the production URL so Open Graph images resolve.

## Rollback

- Platform rollback restores a previous build in seconds. It does not touch the database, environment variables or third-party configuration.
- A release is safely reversible only if the previous build still works against the current schema. Call out any migration in the release that breaks that.
- Know the command or dashboard action before deploying, and write it in the report.

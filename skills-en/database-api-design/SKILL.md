---
name: database-api-design
description: Database schema and API contract design - relations, indexes, safe migrations, transactions, constraints, DTOs, pagination, backward compatibility. Use when designing or auditing schema migrations or API contracts.
trigger: /database-api-design
---

# DATABASE_AND_API_DESIGN_SKILL

## Purpose
Design a solid **database schema** and **API contract**: correct relations, indexes, migrations, transaction integrity, consistent DTO/response models, and backward-compatible APIs.

Use cases:
- Designing a new schema/table/relation
- Writing and reviewing migrations
- Designing an API contract (endpoint + DTO + validation)
- Improving an existing schema/API for performance, consistency, and compatibility

## Role
**Senior Data & API Architect.** Expert in relational modeling, index strategy, migration discipline, and API contract design; fluent in modern stacks like PostgreSQL / Supabase / Prisma. Puts data consistency and backward compatibility above everything else.

## Working Principles
1. **The data model reflects reality.** Understand the domain first (entities and relations); the schema must enforce business rules, not merely store data.
2. **Constraints live in the database.** NOT NULL, UNIQUE, FK, CHECK — integrity is not left to the application layer alone.
3. **Migrations are reversible and safe.** Every migration is designed to be reversible, and the risk of data loss is assessed first.
4. **The API contract is a contract.** Once a field/format is published it binds clients; changes are made backward-compatible.
5. **Performance starts in the design.** Indexes follow query patterns; N+1 and full table scans are prevented from the start.
6. **Consistency > convenience.** Denormalization is done deliberately and with a synchronization plan.

## Workflow
1. **Domain analysis:** Entities, relations (1-1, 1-N, N-N), lifecycle, business rules.
2. **Read the existing schema:** ORM models, migration history, actual DB state; are they in sync with the TypeScript types?
3. **Extract access patterns:** Which queries will run frequently? Index decisions follow these.
4. **Design the schema/contract:** Tables/columns/constraints + endpoints/DTOs/validation.
5. **Surface the risks:** Data loss, locking, breaking change, downtime.
6. **Migration plan:** Order, rollback, a safe strategy for large tables.
7. **Apply and test:** Run the migration on a clean DB and (if possible) on a prod copy; validate the contract with a real request.
8. **Report.**

## Standards (Mandatory Scope)

### Schema Design & Relations
- Appropriate types: `numeric`/`decimal` for money (float ❌), `timestamptz` for time, a deliberate `uuid`/`bigint` choice for identifiers.
- `created_at`, `updated_at` on every table; `created_by`/`updated_by` when needed.
- Relations via FK; a junction table for N-N; deliberate `ON DELETE` behavior (`CASCADE`/`RESTRICT`/`SET NULL`).
- For enums, a DB enum or CHECK + reference table; a constrained value instead of a free-form string field.
- Normalization by default; denormalization only for a measured performance need and with a synchronization plan.

### Index Usage
- Index FK columns and frequently filtered/sorted columns.
- In a composite index, column order follows the query pattern (most selective / equality first).
- Enforce business rules with a unique index (e.g. a user can favorite a resource only once).
- Unnecessary indexes create write cost; justify each index with a query. Use partial and `gin` (search/jsonb) indexes where appropriate.

### Migration Logic
- Every change via a migration (manual DB editing ❌); migrations are designed to be sequential and idempotent.
- Zero-downtime with **expand/contract**: add first (nullable/new column) → let the code run in both modes → migrate the data → contract/drop the old.
- Dropping/renaming a column in a single step is breaking; do it in multiple stages.
- Avoid locking operations on large tables (e.g. `CREATE INDEX CONCURRENTLY` in Postgres).
- A rollback (down) or compensation plan for every migration; the risk of data loss is reported.

### Transaction & Constraint & Data Consistency
- Multiple related writes in a single transaction; no partial success is left behind.
- Race conditions: atomic update (`SET x = x - 1 WHERE x > 0`), an appropriate isolation level, or a row lock.
- Business rules are enforced with a DB constraint (UNIQUE/CHECK/FK) too when possible — application-level checks alone are not sufficient (races).
- Idempotency: a unique key to prevent duplicate records in critical operations.

### Soft Delete & Audit Log
- If soft delete is needed, use `deleted_at`; ALL queries must filter it (a default scope / view). Unique constraints are set up so they do not conflict with soft delete (partial unique).
- Audit log: who-changed-what-when on critical entities; an append-only table or a trigger; mask sensitive data in the audit log too.

### API Contract & DTO / Response Model
- Keep the internal DB model separate from the external DTO: internal columns (hash, internal flag) must not leak into the response — explicit field selection (whitelist).
- A consistent envelope: the same success/error format across the whole API; consistent field names (camelCase or snake_case — a single standard).
- Consistent date/number formats (ISO 8601, a clear decision on string vs number).
- Response types defined as shared types/schemas; in sync with the frontend.

### Validation Layer
- Schema validation on input with Zod (or an equivalent); (optionally) serialization safety with a schema on output too.
- Whitelist/mass-assignment protection; type + range + format + enum checks.

### Pagination / Filtering / Sorting / Search
- Pagination is mandatory; the upper limit is enforced server-side. Cursor-based for large/live data, offset for simple cases.
- Filter/sort fields come from an allowlist; a client-supplied column name never goes directly into the query.
- Search: `ILIKE` for small data, full-text (`tsvector` + gin) or an external search engine for serious needs; parameterized in every case.

### Cache & Rate Limit
- Cache (KV/Redis) for read-heavy, rarely changing data + clear invalidation (tag/key).
- Rate limit on expensive/edge endpoints; cache and rate limit are documented as part of the contract.

### Backward Compatibility
- Adding a field is compatible; removing a field or changing its meaning is breaking.
- If a breaking change is necessary: version it (`/v2`) or deprecate + a transition period; notify clients in advance.
- Adding a new required field breaks old clients; add it with a default or make it optional.

## How Should the AI Behave?
- Before changing the schema, review the existing migration history and the actual data (a sample, if available); do not write a blind migration.
- Justify every new index/column/constraint with an access pattern or a business rule.
- On a contract change, find the consuming frontend/client code; report whether it is breaking.
- Do not run a migration with data-loss or lock risk without approval; present a plan + risk first.
- Run the migration on a clean DB and report the result.

## Critical Warnings
- ⚠️ Dropping/renaming/type-changing a column carries data-loss and downtime risk in prod — do it in multiple stages.
- ⚠️ Holding money with `float` leads to financial errors — use `numeric`.
- ⚠️ When adding a soft delete, do not forget to filter all existing queries; otherwise "deleted" records come back.
- ⚠️ A unique constraint is stronger against race conditions than an application-level check; use both together.
- ⚠️ Silently changing a published API field breaks clients.

## Safe Order to Follow When Changing Code
1. **Read first** — the existing schema, migration history, consuming code.
2. **Then analyze** — relations, access patterns, compatibility, risk.
3. **Then plan** — schema/contract + migration steps + rollback.
4. **Then make a small change** — expand/contract, step by step.
5. **Then test** — migration on a clean DB + contract with a real request.
6. **Then report.**

## To Do
- ✅ Model the domain; enforce integrity with DB constraints.
- ✅ Set up indexes according to the access pattern and justify them.
- ✅ Write migrations safely/incrementally with expand/contract; leave a rollback plan.
- ✅ Separate the internal model from the external DTO; whitelist the response fields.
- ✅ Apply pagination + allowlist filter/sort.
- ✅ Keep API changes backward-compatible; if breaking, version/deprecate.

## Not To Do
- ❌ Editing the DB manually (outside a migration).
- ❌ Using float for money, a timezone-less type for time.
- ❌ Leaving integrity to the application alone without FK/UNIQUE/CHECK.
- ❌ Leaking internal columns (hash, internal flag) into the response.
- ❌ Putting a client-supplied column name directly into orderBy/where.
- ❌ Silently removing/changing a published API field.
- ❌ A list endpoint that returns unbounded records.
- ❌ Running a downtime/data-loss-risky migration without a plan.

## Checklist
- [ ] Schema ↔ ORM ↔ TypeScript types in sync
- [ ] Constraints (NOT NULL/UNIQUE/FK/CHECK) in place
- [ ] Indexes according to the access pattern and justified
- [ ] Migration reversible / risk reported, tried on a clean DB
- [ ] Multiple writes in a transaction; race conditions handled
- [ ] DTO separate from the internal model; response whitelisted
- [ ] Pagination + allowlist filter/sort present
- [ ] Contract change backward-compatible / versioned

## Reporting Format
1. **Analysis performed** (domain + existing schema + access patterns)
2. **Problems found** (consistency/performance/compatibility)
3. **Changes made** (schema + contract + migration)
4. **Files touched**
5. **Why this solution**
6. **Security impact** (data leakage, authorization, PII)
7. **Performance impact** (index, query plan, N+1)
8. **Test result** (migration + contract validation)
9. **Remaining risks** (compatibility, downtime, data migration)
10. **Next recommendations**

## Usage Prompt
```
Load and apply the /database-api-design rules.
Task: [e.g. "Design a schema + API contract for feature X" or "Audit and improve the existing schema
and API for consistency, indexes, and backward compatibility"]
Write migrations safely with expand/contract, and report whether the contract changes are breaking.
```

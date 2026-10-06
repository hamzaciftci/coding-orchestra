# Schema and contract notes

Design details that cause real incidents in PostgreSQL, Prisma and Supabase projects.

## Contents

- [Types](#types)
- [Constraints and relations](#constraints-and-relations)
- [Indexes](#indexes)
- [Soft delete](#soft-delete)
- [Audit trail](#audit-trail)
- [Row level security](#row-level-security)
- [Response shapes](#response-shapes)
- [Pagination, filtering, search](#pagination-filtering-search)
- [Compatibility rules](#compatibility-rules)

## Types

- **Money:** `numeric` / Prisma `Decimal`, or integer minor units. Never `float`. Prisma returns `Decimal` objects that serialize to strings in JSON; decide whether the API sends a string or integer cents and keep it consistent.
- **BigInt:** `JSON.stringify` throws on `bigint`. A `BigInt` id or counter needs explicit conversion in the response layer.
- **Time:** `timestamptz` (Prisma: `@db.Timestamptz`). Prisma's default `DateTime` maps to `timestamp` without zone, which silently shifts when a client or session uses another zone. Send ISO 8601 in UTC.
- **IDs:** pick one scheme per project. Sequential integers leak volume and invite enumeration when exposed; UUIDv4 fragments indexes at very large scale; UUIDv7 or cuid2 are common middle grounds.
- **Enumerated states:** a PostgreSQL enum, or text with a check constraint. Adding a value to a native enum is easy; removing or renaming one is not, so prefer text plus check when the set is still moving.
- **JSON columns:** fine for opaque payloads. Anything you filter or join on should be a real column.

## Constraints and relations

- Decide `ON DELETE` for every foreign key. `CASCADE` on a user row can erase financial records; `RESTRICT` or soft delete is usually right for anything with legal or accounting meaning.
- Many-to-many through an explicit join table once the relation needs its own fields (role, created_at).
- A unique constraint is the only reliable guard against duplicates under concurrency: one membership per user and team, one processed row per webhook event id, one active subscription per account.
- `created_at` and `updated_at` on every table. Prisma's `@updatedAt` is applied by the client, so writes that bypass Prisma do not update it unless a trigger does.

## Indexes

- Index foreign key columns and the columns of your most frequent filters and sorts. PostgreSQL does not index the referencing side of a foreign key automatically.
- Composite index order: equality columns first, then the range or sort column. An index on `(user_id, created_at)` serves "this user's rows by date"; `(created_at, user_id)` does not.
- Partial indexes for hot subsets (`WHERE deleted_at IS NULL`, `WHERE status = 'pending'`).
- Every index slows writes. Justify each with a query, and check the plan with `EXPLAIN` when it matters.

## Soft delete

- A `deleted_at` column means every existing query must now filter on it. Search for all reads of the table before adding it; missing one brings deleted rows back.
- Unique constraints must become partial (`WHERE deleted_at IS NULL`) or a deleted row blocks re-creation with the same key. Prisma's schema cannot express partial indexes; write that part in SQL in the migration.
- Decide what happens to child rows and to data that must really be erased (privacy requests).

## Audit trail

For money, permissions and destructive admin actions, an append-only table recording actor, action, target and time. Do not store secrets or full personal data in it.

## Row level security

- Enable RLS and write policies in the same migration that creates the table.
- Policies need both `USING` (which rows are visible or targetable) and, for inserts and updates, `WITH CHECK` (what the row may look like afterwards). An update policy without `WITH CHECK` lets a user reassign a row to someone else.
- Base policies on `auth.uid()` and on tables or `app_metadata`. `user_metadata` is writable by the user.
- Index the columns policies filter on; a policy is a predicate added to every query.

## Response shapes

- Map database rows to explicit response objects. With Prisma use `select`; with SQL list the columns. Returning rows directly leaks password hashes, internal flags and whatever is added later.
- One naming convention (camelCase or snake_case), one date format, one envelope, one error shape across the API. Follow what exists.
- Share request and response schemas between server and client where the project allows it, so drift becomes a type error.

## Pagination, filtering, search

- A server-enforced maximum page size on every list.
- Cursor pagination (on a unique, ordered key such as `(created_at, id)`) for large or live data; offset for small, stable tables.
- Allowlist sortable and filterable fields.
- Search: `ILIKE` for small tables, `tsvector` with a GIN index or `pg_trgm` beyond that. Always parameterized.

## Compatibility rules

| Change | Existing clients |
|---|---|
| Add an optional response field | Safe |
| Add an optional request field with a default | Safe |
| Add a required request field | Breaks |
| Remove or rename a field | Breaks |
| Change a field's type, format or meaning | Breaks |
| Add a new enum value to a response | Breaks clients with exhaustive handling; announce it |
| Change a status code or error code | Breaks error handling |
| Tighten validation | Breaks callers sending previously accepted input |

For a breaking change: add the new shape next to the old one, migrate consumers, then remove the old one; or version the endpoint. Mobile apps and third parties update slowly, so "the frontend is in the same repo" is only sufficient when it is the only consumer.

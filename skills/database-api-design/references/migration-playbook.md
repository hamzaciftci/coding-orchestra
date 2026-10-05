# Migration playbook (PostgreSQL)

Recipes for changes that are unsafe as a single step. "Release" means a deployment of application code; steps in different releases must not be merged into one.

## Contents

- [Why stages](#why-stages)
- [Rename a column or table](#rename-a-column-or-table)
- [Add a required column](#add-a-required-column)
- [Change a column type](#change-a-column-type)
- [Drop a column or table](#drop-a-column-or-table)
- [Indexes and constraints on large tables](#indexes-and-constraints-on-large-tables)
- [Backfills](#backfills)
- [Prisma specifics](#prisma-specifics)
- [Supabase specifics](#supabase-specifics)

## Why stages

During a deployment, old and new code run at the same time against one schema, and a rollback puts old code back against the new schema. A migration is safe when the schema it leaves behind works with both the previous and the next version of the code.

## Rename a column or table

1. Release A: add the new column (nullable). Write to both columns. Keep reading the old one.
2. Backfill the new column from the old one in batches.
3. Release B: read from the new column. Keep writing both.
4. Release C: stop writing the old column.
5. Later: drop the old column.

For a table, a view with the old name can stand in during the transition.

## Add a required column

1. Add it as nullable, or with a default. In current PostgreSQL versions adding a column with a constant default does not rewrite the table; a volatile default does.
2. Deploy code that always writes it.
3. Backfill existing rows in batches.
4. Add the `NOT NULL` constraint. On a large table, first add `CHECK (col IS NOT NULL) NOT VALID`, validate it, then set `NOT NULL`, which lets PostgreSQL skip the full-table scan under an exclusive lock.

## Change a column type

Treat it as a rename: new column with the new type, dual write, backfill with conversion, switch reads, drop the old column. An in-place `ALTER COLUMN ... TYPE` rewrites the table under an exclusive lock for most conversions and fails midway on values that do not convert.

## Drop a column or table

1. Remove every read and write in code, and deploy that.
2. Confirm nothing else uses it (reports, other services, database views, policies).
3. Drop it in a later release. With an ORM that selects all columns by default, the previous build will fail the moment the column is gone, so the drop cannot share a release with the code change.

## Indexes and constraints on large tables

- `CREATE INDEX CONCURRENTLY` avoids blocking writes. It cannot run inside a transaction, so it needs its own migration with transactions disabled for that file. If it fails it leaves an invalid index that has to be dropped before retrying.
- Unique constraint: build a unique index concurrently, then `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE USING INDEX`. Check for existing duplicates first.
- Foreign key: `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` separately. Index the referencing column; PostgreSQL does not do it for you.
- Set a `lock_timeout` for DDL on busy tables so a blocked migration fails fast instead of queueing every query behind it.

## Backfills

- Batch by primary key range, commit per batch, and make the script safe to rerun.
- Do not backfill inside the schema migration's transaction on a large table.
- A backfill that overwrites existing values is a data rewrite and needs approval and a backup.

## Prisma specifics

- Renaming a field in `schema.prisma` generates `DROP COLUMN` plus `ADD COLUMN`, which loses the data. To rename only the client-side field use `@map`; to rename the real column, use the staged recipe or hand-edit the SQL.
- `prisma migrate dev --create-only` writes the migration without applying it, so the SQL can be reviewed and edited (for example to add `CONCURRENTLY`).
- `prisma migrate dev` may offer to reset the database when history has drifted. That deletes all data. Never accept it against anything but a disposable database.
- `prisma db push` changes the schema with no migration file. Use it for prototypes only; once migrations exist, stay on them.
- Production applies migrations with `prisma migrate deploy`. Do not edit a migration that has already been applied anywhere; add a new one.
- Adding a required field with no default to a model with existing rows fails at deploy time. Follow the required-column recipe.

## Supabase specifics

- Keep schema changes in migration files (`supabase migration new`, `supabase db diff`), not only in the dashboard, so environments can be reproduced.
- Every new table in an exposed schema needs `ENABLE ROW LEVEL SECURITY` and its policies in the same migration. A table without RLS is open to anyone with the anon key.
- Changing a policy changes who can read or write immediately for all clients. Treat it as an auth change and get approval.
- If Prisma and Supabase migrations both exist in one project, find out which one owns the schema before adding to either.

---
name: database-api-design
description: Designs and changes PostgreSQL schemas (Prisma, Supabase, SQL migrations) and API contracts without losing data or breaking existing clients, covering constraints, indexes, zero-downtime expand/contract migrations, row level security, soft delete, response DTOs, pagination and backward compatibility. Use when adding or altering tables, columns, indexes or policies, when writing or reviewing a migration, or when adding, renaming or removing fields in an API request or response.
license: MIT
compatibility: Written for PostgreSQL with Prisma or Supabase migrations. The compatibility rules apply to any relational database and HTTP API.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Database and API design

Schema and contract changes differ from other code changes in one way that matters: existing data and existing clients do not change when you deploy. A migration runs against rows that were written under the old rules, and an API response is read by code that was built against the old shape. Design each change so both survive it.

## Before changing a schema

- Read the current schema, the migration history, and the code that reads and writes the affected tables. If the ORM models, the database and the TypeScript types disagree, find out which is true before adding to the confusion.
- Work out which database a command will touch before running it. Look at the host in the connection configuration without printing credentials. If it might be shared or production, do not run anything against it; write the migration and hand over the command.
- Ask what the queries are. Indexes, denormalization and pagination strategy follow from access patterns, not from the entity diagram.

## Designing

Let the database enforce what must always be true: `NOT NULL`, foreign keys with a deliberate `ON DELETE`, unique constraints for "only one of these", check constraints for ranges and states. Application checks alone lose to concurrent requests and to the next script someone runs by hand.

Details that are easy to get wrong in this stack (money and BigInt serialization, timestamps, soft delete with unique constraints, RLS on new tables, Prisma's handling of renames) are in [references/schema-and-contract-notes.md](references/schema-and-contract-notes.md). Read it when designing tables or response shapes.

## Migrating

Any change that removes or reinterprets something existing code depends on is done in stages: add the new thing, make code work with both, move the data, then remove the old thing in a later release. Renames, type changes, new `NOT NULL` columns and dropped columns all follow this pattern. Step-by-step recipes, including lock-safe index and constraint creation on large tables, are in [references/migration-playbook.md](references/migration-playbook.md). Read it before writing any migration that is more than adding a nullable column or a new table.

Every migration ships with an answer to "how do we get back": a down migration, a compensating migration, or a clear statement that it is irreversible and what backup covers it.

## Stop and ask first

Get explicit approval, with the plan and the risk stated, before:

- running any migration against a database that is not a disposable local or test instance;
- any step that drops or rewrites data (drop column or table, type change, backfill that overwrites);
- a breaking change to a published API field;
- resetting a database or editing migration history.

Writing the migration file and showing it is always fine. Applying it is the user's call.

## API contracts

Treat a published response or request shape as something other code is compiled against. Additive, optional changes are safe; everything else needs a transition (new field alongside old, or a new version) and a search for consumers first. Return explicit, selected fields so that a column added to a table tomorrow does not leak through an endpoint written today.

## Reporting

Say what changed in the schema and contract, which existing rows and clients are affected, what was run and against which database, how to roll back, and which steps of a staged migration are still pending for a later release.

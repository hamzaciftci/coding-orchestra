# Request handling: handlers and Server Actions

Defaults for projects that have no convention of their own, and the places where correct-looking code is wrong.

## Contents

- [Order of checks](#order-of-checks)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Validation](#validation)
- [Errors and response shape](#errors-and-response-shape)
- [Lists](#lists)
- [Server Actions](#server-actions)
- [Contract changes](#contract-changes)

## Order of checks

Cheap rejections first: rate limit (where needed), authentication, input validation, authorization against the loaded record, business logic, response. Keep business logic out of the handler body when the project has a service layer; follow its layout.

## Authentication

- Verify the session on the server in every protected handler and action. If a helper exists (`auth()`, `getUser()`, `requireUser()`), use it; do not write a second mechanism.
- With Supabase on the server, gate on `auth.getUser()` or verified claims. `auth.getSession()` trusts the cookie contents.
- With hand-rolled JWTs: verify with an explicit algorithm, require expiry, and fail at startup if the secret is missing.
- Login, signup and reset responses should not reveal whether an account exists.
- Session cookies: `httpOnly`, `secure`, `sameSite: "lax"` or stricter.

## Authorization

- Put ownership in the query: `where: { id, userId: user.id }`. Loading by id and comparing afterwards works but is easy to forget on the next handler; a scoped query cannot be forgotten halfway.
- For a record the caller may not see, return 404, not 403, when the existence of the record is itself private.
- Check roles against the database for admin and money operations. A role claim in a token is as old as the token.
- Supabase: with the anon or user client, RLS does the scoping, so the policy must exist. With the service-role client nothing does, so scope by hand and keep that client in server-only modules.

## Validation

- Parse `body`, `searchParams`, route `params`, headers you rely on, and webhook payloads. With Zod, `safeParse` and return field-level errors with status 400 or 422, whichever the project uses.
- Build the write from named fields of the parsed result. `data: parsed.data` is safe only when the schema is strict about unknown keys and contains no privileged field.
- Bound everything: string lengths, array sizes, numeric ranges, page sizes.
- IDs in params are input too. Validate their format before they reach the database.

## Errors and response shape

- Use the project's envelope if it has one. If it has none, a workable default is `{ data }` on success and `{ error: { code, message, fields? } }` on failure, with HTTP status carrying the class of result.
- Expected failures (validation, not found, conflict) return specific codes. Unexpected ones are logged with a request id and returned as a generic 500.
- Never return `String(err)`, `err.stack` or the database error.
- Status codes that matter to clients: 400 or 422 invalid input, 401 no valid session, 403 not allowed, 404 not found or hidden, 409 conflict or duplicate, 429 rate limited with `Retry-After`.

## Lists

- Every list endpoint has a page size with a server-enforced maximum.
- Cursor pagination for large or frequently changing sets; offset is fine for small admin tables.
- Sort and filter fields come from an allowlist. A client-supplied column name never goes into `orderBy` or raw SQL.
- Select the columns the client needs. Returning whole rows leaks fields added later.

## Server Actions

- Treat each exported action as a public POST endpoint: authenticate, validate arguments, authorize against the record, in the action itself.
- Arguments, including bound ones and hidden inputs, are attacker-controlled.
- Return plain serializable results designed for the client (`{ ok: true }` or `{ error }`), not database rows. Thrown errors are masked in production, so expected failures should be returned, not thrown.
- Call `revalidatePath` or `revalidateTag` for what the mutation changed.
- For mutations triggered outside a form (webhooks, external clients, mobile apps), use a route handler.

## Contract changes

- Adding an optional field is safe. Removing or renaming a field, changing a type, adding a required request field, or changing a status code breaks existing clients.
- Search the frontend and any other consumers for the endpoint before changing it, and report what you found.
- If a breaking change is necessary, ship the new shape alongside the old one, migrate the callers, then remove the old one.

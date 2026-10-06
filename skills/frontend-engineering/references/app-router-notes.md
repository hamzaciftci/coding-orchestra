# Next.js App Router and modern React notes

Where correct-looking frontend code goes wrong in this stack. Framework defaults differ between major versions; check the installed version before relying on caching or API details.

## Contents

- [Server and client components](#server-and-client-components)
- [Data fetching and state](#data-fetching-and-state)
- [Server Actions and forms](#server-actions-and-forms)
- [Hydration](#hydration)
- [Route files](#route-files)
- [Performance](#performance)
- [Tailwind and theming](#tailwind-and-theming)
- [Security at the UI layer](#security-at-the-ui-layer)

## Server and client components

- Components are server components by default. Add `"use client"` only where there is state, an effect, an event handler or a browser API, and put it as low in the tree as possible. Marking a page or layout as client pulls its whole subtree into the bundle.
- A client component can render server components passed as `children`; it cannot import them.
- Props crossing the boundary must be serializable. Functions (other than Server Actions), class instances and Dates-as-objects in some setups do not cross.
- Server-only modules (database access, secret-bearing clients) should start with `import "server-only"` so importing them from a client component fails the build.
- `async` components, `cookies()`, `headers()` and awaited `params` / `searchParams` are server-side. In recent versions `params` and `searchParams` are promises.
- Context providers are client components. Wrap them in a small provider file and keep the layout itself on the server.

## Data fetching and state

- Fetch in server components where possible and pass data down. Fetching in `useEffect` gives a waterfall, a loading flash and no SEO.
- For client-side server state use the project's cache library (TanStack Query, SWR). Do not copy fetched data into a global store.
- State that should survive a reload or be shareable (filters, tabs, pagination, sort) belongs in the URL.
- Derived values are computed during render, not stored in state and synced with an effect.
- Most `useEffect` calls that set state from props or state are a bug or a redundancy. Effects are for synchronizing with something outside React.
- Memoization (`memo`, `useMemo`, `useCallback`) is for measured problems. With the React Compiler enabled, manual memoization is mostly unnecessary.

## Server Actions and forms

- A Server Action is a public endpoint. It authenticates, validates and authorizes on its own, whatever the form looks like.
- Use `useActionState` for the result and `useFormStatus` (or the pending value) to disable the submit button. Return expected errors from the action as data so the form can show them; thrown errors are replaced with a generic message in production.
- If the project uses React Hook Form with a Zod resolver, keep using it, and share the schema with the server.
- Optimistic updates only where the action can be undone, with a rollback and a message on failure.
- After a mutation, revalidate the affected path or tag, or the user sees stale data.

## Hydration

- A hydration mismatch means the server and the client rendered different markup. Typical causes: `Date.now()`, `Math.random()`, locale-dependent formatting, reading `window` or `localStorage` during render, invalid HTML nesting, and browser extensions.
- Fix the cause (render the client-only value after mount, or pass it from the server). `suppressHydrationWarning` is for the rare unavoidable case such as a theme class on `<html>`.
- Theme switching without a flash needs the theme applied before paint (`next-themes` does this with an inline script).

## Route files

- `loading.tsx` for segment-level skeletons, `error.tsx` (a client component) for segment-level failures, `not-found.tsx` for missing records, `global-error.tsx` for the root.
- Wrap slow parts in `<Suspense>` with a skeleton that matches the final layout so the rest of the page streams first.
- Metadata through `export const metadata` or `generateMetadata`, with `metadataBase` set.

## Performance

- Images through `next/image` with dimensions or `fill` plus `sizes`, and `priority` only on the largest above-the-fold image. Fonts through `next/font`.
- Load heavy client-only widgets (charts, editors, maps) with `next/dynamic`.
- Watch what a client component imports: one icon from a barrel file or a date library can add hundreds of kilobytes.
- Stable, unique `key` values on lists. An index key breaks state when the list reorders.
- Targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms on a mid-range phone.

## Tailwind and theming

- Colours, radii and shadows come from the theme (CSS variables or semantic classes such as `bg-background`, `text-muted-foreground`). A hardcoded `bg-white` or hex value breaks dark mode and drifts from the palette.
- Tailwind v4 configures the theme in CSS with `@theme`; v3 uses `tailwind.config`. Check which one the project is on before adding tokens.
- Merge conditional classes with the project's `cn()` helper (clsx with tailwind-merge). Class names must appear as complete strings in source; `"text-" + color` is never generated.
- Repeated class bundles become a component or a variant (cva), not a copy.
- Use `dvh` units for full-height mobile layouts; `100vh` is taller than the visible area on mobile browsers.
- Accessible primitives for dialogs, menus, popovers and comboboxes come from the project's library (Radix, shadcn/ui, React Aria, Headless UI). Hand-built ones usually miss focus management.

## Security at the UI layer

- `dangerouslySetInnerHTML` and user-supplied `href` values need sanitizing. React escapes text, not HTML or URLs.
- Tokens do not belong in `localStorage`. Nothing secret belongs in a public-prefixed variable or in props passed to a client component.
- Hiding a button is not authorization. The server decides.

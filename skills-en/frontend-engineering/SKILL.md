---
name: frontend-engineering
description: Professional React Nextjs App Router Tailwind frontend - components, state, forms, loading empty error states, responsive, accessibility, SEO, performance, dark mode. Use when building or improving UI pages or components.
trigger: /frontend-engineering
---

# FRONTEND_ENGINEERING_SKILL

## Purpose
To deliver **professional, accessible, fast, and consistent frontend development** on interfaces built with React / Next.js / TypeScript / Tailwind CSS.

Use cases:
- Building new pages/components
- Improving an existing interface, fixing responsive/accessibility issues
- Resolving form, state, and data-flow problems
- Frontend performance and SEO improvements

## Role
**Senior Frontend Lead / Design-minded Engineer.** An engineer with deep knowledge of React and the Next.js App Router, disciplined in design systems, who values user experience and accessibility as much as code quality.

## Working Principles
1. **Every state the user will see is designed:** loading, empty, error, success, partial. A component that renders "only the happy path" is incomplete.
2. **Match the existing design language.** Discover the project's spacing, colors, and component patterns and use them; don't invent a new visual language.
3. **Think server-first (Next.js App Router):** server component by default; use `"use client"` only when interaction/state/effect is required, and at the lowest possible level of the tree.
4. **Keep state as minimal and as local as possible.** State that can live in the URL (filter, tab, page) lives in the URL.
5. **Accessibility is non-negotiable.** An interface that can't be used with a keyboard is an unfinished interface.
6. **Errors are never swallowed silently.** A failed request is shown to the user in an understandable way, with a path to retry.

## Workflow
1. **Analyze the project:** Next.js version, App/Pages Router, UI kit (shadcn/ui? Radix? custom?), state library (React Query/SWR/Zustand?), form library, Tailwind config.
2. **Understand the file structure:** the `app/` layout, layout hierarchy, shared components, existing theme tokens.
3. **Check dependencies:** use the library that already exists; don't add a second library that does the same job.
4. **Find existing bugs:** console errors, hydration errors, missing keys, broken responsive behavior, missing states.
5. **Surface the risks:** if a shared component changes, which pages are affected?
6. **Create a solution plan.**
7. **Implement:** in order of component → state → styling → accessibility → state screens.
8. **Test:** build + typecheck; if possible, verify on the dev server in mobile and desktop views; check that the console is clean.
9. **Report.**

## Frontend Standards (Mandatory Scope)

### Component Architecture
- Small, single-responsibility components; page files handle composition, business logic lives in hooks/services.
- Props interfaces are explicitly typed; `props: any` ❌. Avoid boolean prop explosion (prefer a `variant` union).
- Separate presentational (dumb) and data (container/server) components.
- A repeated UI fragment is extracted into a shared component on its second use (following the existing layout, e.g. `components/ui`, `components/shared`).

### State Management
- Priority order: local state → URL state → React Query/SWR (server state) → global store (Zustand etc., only for what is genuinely global).
- Data coming from the server is not copied into the global store; it lives in the cache library (single source of truth).
- Derived state is not stored separately in state, it is computed during render (`useMemo` only when there is a measurable cost).
- Avoid the anti-pattern of syncing state with `useEffect`; most scenarios are solved in an event handler or during render.

### Form Management and Validation
- Standard: React Hook Form + Zod resolver (or the project's existing solution).
- The schema is shared/mirrored with the backend — client validation is for UX, security lives on the backend.
- Field-level error messages go below the field; the submit error goes above the form in an accessible alert.
- During submit: button disabled + loading indicator + double-submit prevention.
- On success, clear feedback (toast/redirect); if there are unsaved changes, consider a leave-confirmation warning.

### Loading / Empty / Error State Design
- **Loading:** skeletons that don't cause layout shift (preferred over spinners); in Next.js, `loading.tsx` + `<Suspense>`.
- **Empty:** icon/illustration + explanatory text + action CTA ("No projects yet — Create your first project").
- **Error:** message in plain language + a "Try again" action; `error.tsx` boundaries; technical details are not shown to the user.
- Partial error: if one section of the page fails, the whole page does not crash (regional boundary).

### Responsive Design and Mobile-First
- Mobile-first in Tailwind: base (mobile) styles first, then `sm: md: lg:` extensions.
- Test widths: 360-390px (mobile), 768px (tablet), 1280px+ (desktop).
- Touch targets min 44x44px; horizontal scroll never appears by accident; on mobile, tables either turn into cards or scroll within their own container.
- Use `dvh` for `100vh` mobile-browser issues.

### Accessibility (a11y)
- Semantic HTML first: `button`, `nav`, `main`, `label` — div-soup ❌. Use `button` instead of a clickable `div`.
- All interaction is possible with a keyboard; focus is visible (`focus-visible` styles are not removed).
- If images are meaningful, `alt` is filled in; if decorative, `alt=""`.
- Form inputs are tied to a `label`; error messages are associated via `aria-describedby`.
- Focus trap in modals/dropdowns + close with Escape (Radix/shadcn provide this — don't write your own).
- Color contrast at WCAG AA (normal text 4.5:1); information is not conveyed by color alone.

### SEO
- A unique `title` + `description` on every page via the Next.js Metadata API; `generateMetadata` on dynamic pages.
- A single `h1`, a sensible heading hierarchy; meaningful link text ("click here" ❌).
- OG/Twitter cards, canonical URL, `sitemap.ts` + `robots.ts`.
- Content pages are rendered as server components (client-only content is a loss for SEO).

### Performance Optimization
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- `next/image` is mandatory (dimensions specified, `priority` on the LCP image); font loading via `next/font` (prevents CLS).
- Lazy-load heavy client libraries with `next/dynamic`; components like charts/editors load when they enter the viewport.
- Bundle awareness: for dates use dayjs/date-fns (moment ❌), full lodash import ❌; check suspicious growth with `@next/bundle-analyzer`.
- Stable `key` in list renders (index-key only in a static list).

### Dark Mode
- Colors always via tokens (CSS variables / Tailwind semantic colors: `bg-background`, `text-foreground`); hardcoded `bg-white` in new code ❌.
- Class strategy via `next-themes` (or the existing solution); FOUC is prevented; the `prefers-color-scheme` default is supported.
- Every new component is checked in both themes.

### UI Consistency and Design System Logic
- Spacing on a 4px grid and consistent with the project's existing scale; random `mt-[13px]` ❌.
- Button/input/card variants come from a central component; an inline restyled "fake button" within a page ❌.
- Color palette, radius, and shadow scales come from Tailwind config/tokens; one-off hex values are not added.

### Tailwind CSS Best Practice
- Consistency in class ordering (follow prettier-plugin-tailwindcss if present).
- Conditional classes via `cn()`/`clsx` + `tailwind-merge`; string-concatenation mess ❌.
- Repeated long class strings are extracted into a component (or a `cva` variant); `@apply` at a minimum.
- Arbitrary values (`w-[347px]`) only when truly necessary.

### React Best Practice
- Hook rules: conditional hooks ❌, honest dependency arrays (a lint warning is not silenced, the cause is resolved).
- `useEffect` is a last resort: data fetching in React Query/server component, synchronization in an event.
- Memoization (`memo`, `useMemo`, `useCallback`) as a remedy for a measured problem; sprinkling it everywhere ❌.
- A list without a key prop, defining a component inside render, mutating state ❌.

### Next.js App Router Best Practice & Client/Server Separation
- Data fetching in server components; secrets only on the server side (mark with the `server-only` package).
- The `"use client"` boundary is deliberate: interactive leaf components are client, the page skeleton is server.
- If Server Actions are used: validate the input with Zod + do the auth check inside the action (actions are public endpoints!).
- `loading.tsx`, `error.tsx`, `not-found.tsx` defined in route segments.
- Make the Route Handler vs Server Action decision according to the project's existing pattern.

### User Experience, Microcopy, Toast
- **Microcopy:** buttons state the action ("Save", "Delete Project") — "OK/Yes" ❌. Error messages suggest a solution ("Couldn't connect. Check your internet and try again.").
- **Toast:** success is short (2-4s) and auto-dismisses; errors are more persistent + may include an action; toast pile-ups at the same time are prevented (sonner etc.). Critical confirmations go in a dialog, not a toast.
- **Destructive operations:** confirmation dialog + the outcome of the action is written clearly ("This action cannot be undone. 12 records will be deleted.").
- Optimistic updates only for reversible operations; on error, the state is rolled back and the user is informed.

### Frontend Security Checklist
- [ ] No `dangerouslySetInnerHTML`; if present, the content is sanitized (DOMPurify)
- [ ] User-generated URLs are validated (`javascript:` ❌); `rel="noopener noreferrer"` on external links
- [ ] No secret/service key in the client bundle (audit `NEXT_PUBLIC_`)
- [ ] Auth/role checks are not just UI hiding — the real check is on the backend; the UI only reflects it
- [ ] No sensitive token stored in localStorage (prefer httpOnly cookie)
- [ ] Form data is also validated on the backend (client validation is not security)

## How Should the AI Behave?
- Before writing new UI, read a similar page/component in the project; imitate the pattern there.
- Before touching a shared component, find all the places that use it (`grep`) and report the blast radius.
- On every component delivery, state that you have explicitly handled the four states (loading/empty/error/success) and the mobile view.
- Verify visual changes in the running app if possible; if you couldn't verify, write "visual verification was not performed" in the report.
- Don't rush and leave accessibility and responsiveness "for later".

## Critical Warnings
- ⚠️ A change to a global style/theme token affects the entire app — impact analysis first.
- ⚠️ If you see a hydration error, don't silence it; resolve the root cause of the server/client output difference.
- ⚠️ Don't add `"use client"` to the top of a file out of habit; every addition is a bundle cost.
- ⚠️ When rewriting a working form/flow, don't lose existing edge-case behaviors (draft, redirect, query param).

## Safe Order to Follow When Changing Code
1. **Read first** — the target component + where it is used + theme/token files.
2. **Then analyze** — state flow, server/client boundary, responsive behavior.
3. **Then plan** — component tree, new/changed files.
4. **Then make a small change** — proceed component by component.
5. **Then test** — build, console, mobile+desktop, keyboard navigation, dark mode.
6. **Then report.**

## To Do
- ✅ Implement loading/empty/error/success state for every data-displaying component.
- ✅ Mobile-first responsive; layout that doesn't break at 360px.
- ✅ Semantic HTML + keyboard access + visible focus.
- ✅ Performance hygiene with `next/image`, `next/font`, dynamic import.
- ✅ Form: RHF + Zod, field-level errors, double-submit prevention.
- ✅ Use all colors/spacing from the existing token system; verify in dark mode.
- ✅ Deliver a clean console (zero error/warning target).

## Not To Do
- ❌ Swallowing errors silently (empty catch, an unshown fetch error).
- ❌ Delivering a component that renders only the happy path.
- ❌ A clickable div, an input without a label, a meaningful image without alt.
- ❌ Putting a secret in client code / `NEXT_PUBLIC_`.
- ❌ Adding a new library that does the same job instead of the existing UI kit.
- ❌ Breaking the design system with hardcoded color/spacing.
- ❌ Delivering an interface that's beautiful on desktop but broken on mobile.
- ❌ Setting up chained state sync inside `useEffect`.

## Checklist
- [ ] Typecheck + lint + build pass
- [ ] No error/warning in the console (including hydration)
- [ ] All 4 states (loading/empty/error/success) present
- [ ] Mobile (≤390px) and desktop views correct
- [ ] Keyboard navigation + focus visibility work
- [ ] Dark mode (if present) not broken
- [ ] Images use `next/image`, fonts use `next/font`
- [ ] SEO metadata defined (if a page was added)
- [ ] Frontend security checklist checked off

## Reporting Format
1. **Analysis performed** (existing UI architecture, the kit and patterns used)
2. **Problems found**
3. **Changes made** (per component/page)
4. **Files touched**
5. **Why this solution**
6. **Security impact**
7. **Performance impact** (bundle, CWV, render behavior)
8. **Test result** (build, visual verification, which viewports)
9. **Remaining risks**
10. **Next suggestions**

## Usage Prompt
```
Load and apply the /frontend-engineering rules.
Task: [e.g. "Make this project's interface professional according to this skill" or "Build page X to this skill's standards"]
Report the 4-state + mobile + a11y + dark mode check for each component.
```

---
name: frontend-engineering
description: Builds and polishes React, Next.js App Router and Tailwind interfaces to a professional standard, covering server and client component boundaries, forms, loading, empty and error states, accessibility, responsive layout, dark mode, performance, visual consistency and microcopy. Use when creating or changing pages or components, when an interface looks amateur or inconsistent and needs polish, or when reviewing frontend code, a dashboard or a landing page for quality.
license: MIT
compatibility: Written for React with the Next.js App Router and Tailwind CSS. The quality bar and the polish review apply to any component framework.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Frontend engineering

Start from what the project already has. Find its components, tokens, spacing scale, form and data-fetching patterns, and build with those. A new screen that introduces its own button style, colour values or state library makes the product look less finished, however good it is in isolation. If the project has no system yet, say so and propose a small one (tokens and a handful of base components) before styling screens individually.

## What "done" means for an interface

Most unfinished UI is finished on the happy path only. A screen is done when:

- **Every state is designed.** Loading without layout shift, empty with an explanation and a next action, error in plain language with a way to retry, partial failure that does not take down the page, and success feedback.
- **It works without a mouse and without perfect eyesight.** Real buttons and links, labelled inputs, visible focus, errors tied to their fields, contrast at WCAG AA, nothing conveyed by colour alone.
- **It holds at 360 px and at 1440 px.** No accidental horizontal scroll, touch targets around 44 px, tables that reflow or scroll inside their own container.
- **It holds in both themes** if the project has dark mode, which means colours come from tokens.
- **Forms defend against real use.** Field-level errors, disabled and busy states during submit, no double submission, input preserved after a failed submit. Client validation is for the user's benefit; the server validates again.
- **Destructive actions say what will happen** and ask first.
- **Copy is specific.** Buttons name the action, errors say what to do next.

## App Router specifics

The server and client component boundary, caching, Server Actions and hydration are where current React differs from what older code and habits assume. Read [references/app-router-notes.md](references/app-router-notes.md) when working in a Next.js App Router project, and before adding `"use client"`, `useEffect` data fetching or a global store.

## Polish work

When the task is to make an existing interface look and feel professional, review before restyling. [references/polish-review.md](references/polish-review.md) gives the dimensions to assess (hierarchy, type, spacing, colour, states, forms, mobile, copy, landing pages) and how to turn them into a prioritized list. Fix system-level causes first: one corrected token or base component improves every screen, and screen-by-screen tweaks drift apart again.

Polish must not change behaviour. Form submission, navigation, analytics hooks and query parameters should work exactly as before; if a visual change requires a behaviour change, call it out.

## Verifying

Look at the result in a browser if you have any way to (a dev server and a browser tool, screenshots, the project's visual or end-to-end tests), at mobile and desktop widths and in both themes. Run typecheck, lint and tests. If you could not see it rendered, say so plainly; UI that only compiled has not been verified.

Changes to global tokens, the theme or shared base components affect every screen. Check a few unrelated screens after touching them, and mention the reach of the change in your summary.

# Polish review

A way to assess an interface that works but looks unfinished, and to decide what to fix first. Use it as a lens, then report findings by impact; it is not a form to fill in for every screen.

## Contents

- [How to run the review](#how-to-run-the-review)
- [Dimensions](#dimensions)
- [What usually makes UI look amateur](#what-usually-makes-ui-look-amateur)
- [Landing pages](#landing-pages)
- [Reporting](#reporting)

## How to run the review

1. Look at the product, not only the code. Open the main screens at mobile and desktop widths, in both themes, with empty, full and error data where you can produce them.
2. Find the system first: tokens, base components, type scale, spacing scale. Note where screens bypass it.
3. Pick the two or three screens that carry the product (first run, main dashboard or list, the primary form, pricing or landing). Depth there is worth more than a shallow pass over everything.
4. Separate causes from symptoms. Twenty misaligned cards are usually one missing layout component.

## Dimensions

**Hierarchy.** Each screen has one obvious primary action and a clear reading order. If everything is bold or coloured, nothing is. Secondary actions are visually quieter.

**Typography.** A small fixed scale (for example 12, 14, 16, 20, 24, 30, 36), at most two families, body line height around 1.5, lines of 60 to 75 characters, tabular figures in numeric columns.

**Spacing.** Values from a 4 or 8 px scale. Related things sit close, unrelated things sit apart. Consistent padding inside cards and consistent gaps between sections. Cramped layouts read as amateur faster than anything else.

**Colour.** Semantic roles (background, foreground, primary, muted, border, destructive, success, warning) used consistently. The primary colour is rare enough to mean something. Contrast meets AA. State is carried by icon or text as well as colour.

**Consistency.** The same element looks the same everywhere: one button set, one input style, one radius scale, one shadow scale, one icon family at one stroke weight.

**States.** Skeletons shaped like the content, empty states that explain and offer the first action, errors in human language with retry, visible success. Buttons have hover, focus, active, disabled and busy states.

**Forms.** Labels above fields (placeholders are not labels), errors beneath the field they belong to, sensible tab order, long forms grouped or stepped, required fields marked, save state visible.

**Feedback.** Toasts are short for success and persistent with an action for errors, in one position, never stacked five deep. Irreversible confirmations use a dialog that states the consequence.

**Mobile.** Nothing overflows, primary actions are reachable with a thumb, sticky bars do not cover content, tables reflow into cards or scroll within themselves.

**Copy.** Buttons say what happens ("Create project", not "Submit"). Errors say what to do. Empty states encourage. Terminology is the same on every screen.

**First run.** A new account sees guidance and a first step, not an empty dashboard. Every required field at signup costs conversions; ask only for what is needed now.

## What usually makes UI look amateur

In rough order of how often it is the cause:

1. Inconsistent spacing and alignment.
2. Too many font sizes and weights.
3. No clear primary action; several elements competing.
4. Colour used decoratively instead of semantically; low contrast greys.
5. Missing states: blank screens while loading, raw error strings, empty tables.
6. Mixed component styles from different sources.
7. Generic or developer-facing copy.
8. Effects (gradients, blur, shadows, animation) used to add interest where structure is missing.

## Landing pages

A landing page needs, in order: a headline that states the value in the visitor's terms, one primary call to action, a visual of the product, proof (customers, numbers, testimonials), the main benefits, answers to objections (pricing clarity, FAQ, trust signals such as "no card required"), and a closing call to action. Check load speed and the mobile layout before anything decorative.

## Reporting

Report findings as a short prioritized list, each with where it is, why it matters to a user, and the fix. Group by cause: system-level fixes (tokens, base components) first, then the key screens, then remaining details. Say which screens you actually viewed rendered and which you assessed from code only.

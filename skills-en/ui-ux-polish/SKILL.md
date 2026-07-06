---
name: ui-ux-polish
description: Take a product from amateur to professional SaaS quality - visual hierarchy, typography, spacing, color system, state screens, microcopy, mobile, trust. Use to polish or professionalize an interface or landing page.
trigger: /ui-ux-polish
---

# UI_UX_PRODUCT_POLISH_SKILL

## Purpose
Take a product from an **amateur look to professional SaaS/web app quality**: produce a trustworthy, polished experience through visual hierarchy, typography, spacing, color system, state screens, microcopy, and flow simplification.

Use cases:
- "This interface looks amateur, make it professional" tasks
- Landing page / dashboard / onboarding polishing
- Consolidating inconsistent design into a single system
- Bringing a product to launch-ready visual quality

## Role
**Senior Product Designer + Design Engineer.** An expert who understands why good SaaS products look "expensive" and "trustworthy"; who wields the power of typography, whitespace, and consistency; and who can translate design into code. Produces clarity and trust, not decoration.

## Working Principles
1. **Consistency is the biggest polisher.** The same thing looks the same everywhere: buttons, cards, spacing, headings.
2. **Less but clearer.** Reduce visual noise; on every screen a single primary action stands out.
3. **Whitespace is a luxury.** A layout that breathes looks professional; a cramped interface looks amateur.
4. **System > one-off decisions.** Define color/typography/spacing tokens and use them everywhere.
5. **Every state is designed.** Empty/loading/error/success are not ignored; product quality shows in these details.
6. **Trust lives in the micro details.** Clear microcopy, aligned icons, consistent radius/shadow tell the user "this product is serious."

## Workflow
1. **Audit the current design:** Screen by screen, list inconsistencies, alignment issues, missing states, and weak microcopy.
2. **Token inventory:** Extract the existing color/spacing/typography system; if it's scattered, consolidate it into one system.
3. **Set priorities:** The most-viewed screens (landing, dashboard, main flow) first.
4. **Build/fix the system:** Typographic scale, spacing scale, color roles, component variants.
5. **Polish the screens:** Hierarchy → whitespace → consistency → state screens → microcopy.
6. **Verify responsive + a11y + dark mode.**
7. **Do visual verification** (in the running app if possible).
8. **Report.**

## Standards (Mandatory Scope)

### Visual Hierarchy
- A clear reading order on every screen: primary heading → content → primary action. A single dominant CTA; secondary actions visually in the background (ghost/outline).
- Order of importance via size, weight, color, and position; emphasizing everything means emphasizing nothing.

### Typography
- A limited typographic scale (e.g. 12/14/16/20/24/30/36); no random font sizes.
- Readable line height (body ~1.5), line length ~60-75 characters.
- Meaningful font weights (headings semibold/bold, body normal); at most 2 families.
- Tabular figures in tables for numbers/alignment; deliberate tracking in headings.

### Spacing
- A 4/8px-based scale; consistent padding/margin; no random `13px` values.
- Breathing room between sections; related items close, unrelated ones far apart (proximity principle).
- Consistent card/inner padding; grid alignment preserved.

### Color System
- Semantic roles: `background`, `foreground`, `primary`, `muted`, `border`, `destructive`, `success`, `warning`. Tokens instead of hardcoded hex.
- A limited palette; the primary color used sparingly and purposefully (it doesn't paint everything).
- WCAG AA contrast; state colors (success/error) conveyed not by color alone but also with icon/text.

### Responsive & Mobile Experience
- Mobile-first; a layout that doesn't break at 360-390px; touch targets ≥44px.
- No horizontal scroll; tables become cards/scroll on mobile; sticky header/footers don't crush content.
- On mobile, the primary action is within thumb's reach.

### State Screens (Empty / Error / Loading / Skeleton)
- **Empty:** icon/illustration + description + CTA; an empty table says not "no data" but "Create your first X".
- **Loading:** skeleton (no layout shift) > spinner; improve perceived speed.
- **Error:** human language + retry; no technical jargon.
- **Success:** clear, brief feedback.

### Button State & Form UX
- Button states: default/hover/active/focus/disabled/loading — all designed; on loading, spinner + disabled + double-click guard.
- Form: field-level errors (below the field), reasonable inline validation, clear label vs. placeholder distinction, sensible tab order, auto-focus on the first field.
- Long forms are split (steps/groups); required fields marked; save status visible.

### Toast / Notification
- Success is brief & auto-dismisses; errors are more persistent + actionable; stacking is prevented; critical confirmations in a dialog (not a toast).
- Consistent position; accessible (role/aria-live).

### Onboarding & Flow Simplification
- Value shown quickly on first use; unnecessary steps/fields removed (every extra field lowers conversion).
- Instead of an empty dashboard, guiding first-step cards; a progress indicator; a "skip" option.
- Reduce the number of clicks in the user flow; pick smart defaults.

### Accessibility
- Semantic HTML, keyboard access, visible focus, `label`/`aria` relationships, contrast; colorblind-safe state indication.

### SEO Copy & Trust-Building Microcopy
- Headings with a clear value proposition; action-oriented button text ("Start free", "Save project").
- Trust elements: privacy/pricing clarity ("No card required"), reassuring language after errors, encouragement in empty states.
- Metadata (title/description) done right for both SEO and sharing.

### Professional Landing Page Quality
- A clear hero (value proposition + single primary CTA + visual), social proof, features/benefits, FAQ, a strong closing CTA.
- Consistent rhythm (section spacing), high-quality imagery/icons, flawless on mobile, fast loading.

## How Should the AI Behave?
- Before polishing, discover the existing token system; don't impose your own random color/spacing.
- Build a system rather than one-off "beautification"; apply a decision (spacing scale, color role) consistently everywhere.
- Improve the look without breaking function; preserve the existing flow's behavior (routing, validation).
- Verify changes visually in the running app if possible; if you didn't verify, note it in the report.
- Avoid excessive animation/flashiness; professionalism is simplicity and consistency.

## Critical Warnings
- ⚠️ A global token/theme change affects the whole app — do impact analysis first.
- ⚠️ Don't break accessibility while polishing (low contrast, removing focus, decorative but unreadable text).
- ⚠️ A visual change must not alter functional behavior (form submit, redirect).
- ⚠️ "Trendy" effects (excessive blur/gradient/animation) can degrade performance and readability.

## Safe Order When Changing Code
1. **Read first** — the target screen + token/theme files + shared components.
2. **Then analyze** — inconsistencies, missing states, hierarchy issues.
3. **Then plan** — system decisions + screen priorities.
4. **Then make small changes** — per component/screen.
5. **Then test** — visual verification, responsive, dark mode, a11y.
6. **Then report.**

## Do
- ✅ Consolidate color/spacing/typography into one system and use tokens everywhere.
- ✅ A clear hierarchy and a single primary CTA on every screen.
- ✅ Design all state screens (empty/loading/error/success).
- ✅ Implement button/form states completely; clarify microcopy.
- ✅ Verify mobile, dark mode, and a11y.
- ✅ Check changes visually.

## Don't
- ❌ Break the system with hardcoded color/spacing.
- ❌ Beautify only desktop and break mobile.
- ❌ Skip state screens (happy path only).
- ❌ Sacrifice contrast/focus/accessibility for aesthetics.
- ❌ Change functional behavior during visual polish.
- ❌ Produce noise and slowness with excessive animation/effects.
- ❌ Leave meaningless button text like "OK/Yes".

## Checklist
- [ ] Color/spacing/typography conform to the token system and are consistent
- [ ] Clear hierarchy + a single primary CTA on every screen
- [ ] Empty/loading/error/success states present
- [ ] Button and form states complete
- [ ] Microcopy clear and trustworthy
- [ ] Mobile (≤390px) + dark mode + a11y verified
- [ ] Visual verification done
- [ ] Functional behavior preserved

## Reporting Format
1. **Analysis performed** (inventory of inconsistencies/gaps + token status)
2. **Problems found**
3. **Changes made** (system decisions + per screen)
4. **Files touched**
5. **Why this solution**
6. **Security impact** (usually neutral — note exceptions)
7. **Performance impact** (visuals/assets/animation)
8. **Test result** (visual verification + responsive + dark mode + a11y)
9. **Remaining risks**
10. **Next recommendations**

## Usage Prompt
```
Load and apply the /ui-ux-polish rules.
Task: Take this product from an amateur look to professional SaaS quality. First audit the inconsistencies and
missing state screens, establish the color/spacing/typography system, and polish starting from the most-viewed
screens. Verify mobile + dark mode + a11y and report with the visual verification results.
```

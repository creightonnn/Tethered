# Typography Refresh + Surface Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sitewide display serif (Domine → Fraunces) with Domine kept as fallback, bring marketing's eyebrow labels onto the same badge-font convention the Guide dashboard already uses, and extend the marketing hero's existing glow — refactored onto a theme-color-driven `color-mix()` pattern instead of hardcoded colors — to the Guide dashboard and Traveler home.

**Architecture:** `--font-display` is a single custom property defined once in `tokens.css` outside any `[data-theme]` block, so changing it cascades to every headline across marketing, Guide, and Traveler with no other file needing to change for that part. The glow is a short, duplicated (not abstracted — only 3 uses, direct is more debuggable than a custom-property indirection) `background` gradient pattern using `color-mix(in srgb, var(--accent) N%, transparent)` against each surface's own theme tokens, added to the marketing hero's existing rule (replacing its hardcoded colors), Guide's existing `.gd` rule, and a new `.trv-home` rule for Traveler.

**Tech Stack:** Fontsource (`@fontsource/fraunces`, same self-hosted-font pattern as every other font already in this project), plain CSS `color-mix()` (no new JS dependency).

## Global Constraints

- `--font-body` (Public Sans) and `--font-mono` (JetBrains Mono) are not touched anywhere — confirmed with the user as Approach A. (Spec: Non-goals)
- No mono-styled "data/waypoint" element migrates to the badge font: `.story__mark`, the showcase compass readout, `.phone__label`, countdown/stat values, and `.trust-line` (confirmed during planning — `.trust-line` is a full-sentence credibility statement in `Audience.tsx`, "Tested on a real 11-day Hokkaido tour...", which reads as fine print, not a badge — it stays mono). (Spec: Goal 3)
- The already-shipped grain texture (SVG, opacity, blend mode, per-theme `--grain-opacity`) is not touched — this plan is additive to it. (Spec: Non-goals)
- Domine stays in the `--font-display` fallback chain, not dropped. (Spec: Goal 1)
- No new page, section, or component. (Spec: Non-goals)
- This repo has no test runner — verification is `npm run build`, `npm run lint`, and a visual pass across all three theme surfaces (marketing, Guide, Traveler), matching how prior work in this repo was verified.

---

### Task 1: Typography — Fraunces display font + Bevan eyebrow on marketing

**Files:**
- Modify: `package.json` / `package-lock.json` (via `npm install`, not hand-edited)
- Modify: `src/index.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/marketing/marketing.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new for later tasks — Task 2 is independent of this one (background/glow only, no typography dependency).

- [ ] **Step 1: Install the Fraunces font package**

Run: `npm install @fontsource/fraunces`

- [ ] **Step 2: Add Fraunces weight imports to `src/index.css`**

In `src/index.css`, insert these 4 lines immediately after the existing `@fontsource/domine/700.css` import and before the `@fontsource/bevan/400.css` import:

```css
@import '@fontsource/fraunces/400.css';
@import '@fontsource/fraunces/500.css';
@import '@fontsource/fraunces/600.css';
@import '@fontsource/fraunces/700.css';
```

The full top of the file should read:

```css
@import '@fontsource/domine/400.css';
@import '@fontsource/domine/500.css';
@import '@fontsource/domine/600.css';
@import '@fontsource/domine/700.css';
@import '@fontsource/fraunces/400.css';
@import '@fontsource/fraunces/500.css';
@import '@fontsource/fraunces/600.css';
@import '@fontsource/fraunces/700.css';
@import '@fontsource/bevan/400.css';
@import '@fontsource/public-sans/400.css';
@import '@fontsource/public-sans/500.css';
@import '@fontsource/public-sans/600.css';
@import '@fontsource/public-sans/700.css';
@import '@fontsource/public-sans/800.css';
@import '@fontsource/jetbrains-mono/500.css';
@import '@fontsource/jetbrains-mono/600.css';
@import '@fontsource/jetbrains-mono/700.css';
@import './styles/tokens.css';
@import './styles/tailwind.css';
@import './styles/global.css';
```

- [ ] **Step 3: Change the `--font-display` token in `src/styles/tokens.css`**

Find (in the `/* -- type -- */` block, near the top of the file):

```css
  --font-display: 'Domine', 'Public Sans', serif;
```

Replace with:

```css
  --font-display: 'Fraunces', 'Domine', 'Public Sans', serif;
```

This is defined once, outside any `[data-theme]` block, so it applies to marketing, Guide, and Traveler simultaneously — no other file references `'Domine'` directly as a font-family value (confirmed via `grep -rn "font-family.*Domine" src` during planning — the only literal `'Domine'` references left after this change are the fallback in this token and `src/dev/BrandBoard.tsx`'s internal showcase, which is a dev-only tool and out of scope).

- [ ] **Step 4: Switch marketing's eyebrow labels to the badge font**

In `src/marketing/marketing.css`, find:

```css
.mkt .eyebrow-mkt {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--accent-strong);
```

Change `font-family: var(--font-mono);` to `font-family: var(--font-badge);`. The rest of the rule (font-size, letter-spacing, text-transform, color, and anything below it) stays unchanged.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings in unrelated files are fine, matching the bar used throughout this project).

- [ ] **Step 7: Verify with Playwright — Fraunces actually loads and renders**

Run: `npm run dev` (background it, note the port it prints).

Using the Playwright MCP tools (or an equivalent browser-automation tool if Playwright's MCP connection is unavailable — note explicitly which tool you used):

- Navigate to the marketing page (desktop, 1440×900). Confirm via `getComputedStyle` on the hero's `<h1>` that `fontFamily` includes `Fraunces` (not just that the CSS says so — confirm the browser actually resolved and loaded the font, e.g. via `document.fonts.check("16px Fraunces")` returning `true`, or by checking the Network tab / `agent-browser get styles` for a loaded `@font-face`).
- Confirm the hero headline visually renders in Fraunces (distinctly different letterforms from the previous Domine — Fraunces has a noticeably higher-contrast, more editorial character), and that the tagline eyebrow pill ("For guided group tours") now renders in Bevan (bold, chunky, condensed — distinctly different from the JetBrains Mono it used before).
- Confirm the `.story__mark` labels ("Hokkaido, day 6", etc.) still render in JetBrains Mono, unchanged — this must NOT have switched to Bevan or Fraunces.
- Confirm the `.trust-line` text (in the Audience section, "Tested on a real 11-day Hokkaido tour...") still renders in JetBrains Mono, unchanged.
- Navigate to `/app`, enter the demo trip code `HOKKAIDO`, go to the guide dashboard (`I'm the guide`). Confirm the trip name heading (`.topbar__title`) renders in Fraunces, and confirm `.gd-header__eyebrow` ("Live") still renders in Bevan (it already did before this change — must be unchanged).
- Switch to Traveler view. Confirm the trip name heading renders in Fraunces on the light theme too.
- Check `browser_console_messages` at `error` level — expected: none attributable to this change (pre-existing extension noise is fine).
- Kill the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/index.css src/styles/tokens.css src/marketing/marketing.css
git commit -m "feat: swap display font to Fraunces, align marketing eyebrows to the badge font"
```

---

### Task 2: Surface glow — refactor hero, extend to Guide and Traveler

**Files:**
- Modify: `src/marketing/marketing.css`
- Modify: `src/app/app.css`
- Modify: `src/app/traveler/Home.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 — independent change.
- Produces: nothing for later tasks (this is the last task in the plan).

Theme color values referenced below (already defined in `src/styles/tokens.css`, not changed by this task — shown here so the glow's expected color per surface is verifiable without cross-referencing another file):

| Theme | `--accent` | `--primary` |
|---|---|---|
| marketing | `--amber-600` (`#e8a13a`) | `--green-600` |
| guide | `--amber-600` (`#e8a13a`) | `--green-500` |
| traveler | `--amber-700` | `--green-600` |

- [ ] **Step 1: Refactor the marketing hero's glow onto `color-mix()`**

In `src/marketing/marketing.css`, find:

```css
  /* Subtle top glow, concentrated where the eye lands first; fades out
     well before the marquee at the bottom. Set here instead of a
     Tailwind bg-[...] utility: Tailwind's arbitrary-value parser doesn't
     reliably compile multi-gradient values with nested commas like this
     (confirmed empirically — the class generated no CSS rule at all). */
  background:
    radial-gradient(ellipse 70% 55% at 50% -8%, rgba(232, 161, 58, 0.14), transparent 62%),
    radial-gradient(ellipse 60% 40% at 82% 100%, rgba(43, 100, 76, 0.16), transparent 65%),
    var(--bg);
```

Replace with:

```css
  /* Subtle top glow, concentrated where the eye lands first; fades out
     well before the marquee at the bottom. Set here instead of a
     Tailwind bg-[...] utility: Tailwind's arbitrary-value parser doesn't
     reliably compile multi-gradient values with nested commas like this
     (confirmed empirically — the class generated no CSS rule at all).
     Uses color-mix() against this theme's own --accent/--primary instead
     of hardcoded rgba() so the same pattern works unmodified on Guide's
     and Traveler's own colors (see .gd and .trv-home in src/app/app.css). */
  background:
    radial-gradient(ellipse 70% 55% at 50% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%),
    radial-gradient(ellipse 60% 40% at 82% 100%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%),
    var(--bg);
```

Only the two `radial-gradient()` color stops change (hardcoded `rgba()` → `color-mix()` against the theme tokens); the ellipse geometry, transparent stops, and trailing `var(--bg)` are identical to before, so this must render visually the same on the marketing page as it does today.

- [ ] **Step 2: Add the same glow to the Guide dashboard**

In `src/app/app.css`, find:

```css
/* -- guide dashboard: instrument cluster (checkpoint 2) -- */
.gd {
  position: relative;
  overflow: hidden;
}
```

Replace with:

```css
/* -- guide dashboard: instrument cluster (checkpoint 2) -- */
.gd {
  position: relative;
  overflow: hidden;
  /* Same restrained top glow as the marketing hero (see marketing.css),
     using this theme's own --accent/--primary via color-mix(). Sits
     beneath .gd-contours (z-index: 0) since it's a background, not an
     element — no z-index conflict. */
  background:
    radial-gradient(ellipse 70% 55% at 50% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%),
    radial-gradient(ellipse 60% 40% at 82% 100%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%),
    var(--bg);
}
```

This overrides the flat `background: var(--bg)` that `.screen` (also applied to this element) sets — `.gd`'s rule already wins today for the same reason (both classes are equal specificity, `.gd` is declared later in this file than `.screen`, so it wins on source order), so this is not a new override mechanism, just a richer `background` value on the rule that already wins.

- [ ] **Step 3: Add a scoping class to Traveler home's root element**

In `src/app/traveler/Home.tsx`, find:

```tsx
    <div className="screen screen--pad-top">
```

Replace with:

```tsx
    <div className="screen screen--pad-top trv-home">
```

- [ ] **Step 4: Add the Traveler home glow rule**

In `src/app/app.css`, add this new rule immediately after the `.gd .gd-contours` block (after the closing `}` that follows the `gd-drift` reference, before the next rule in the file):

```css
.trv-home {
  /* Same restrained top glow as the marketing hero and Guide dashboard
     (see marketing.css and .gd above), using Traveler's own
     --accent/--primary via color-mix(). Traveler has no absolutely-
     positioned decoration layer like Guide's .gd-contours, so this
     doesn't need position/overflow changes — it's a plain background
     override on top of what .screen already sets. */
  background:
    radial-gradient(ellipse 70% 55% at 50% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%),
    radial-gradient(ellipse 60% 40% at 82% 100%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%),
    var(--bg);
}
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Verify with Playwright — glow renders correctly on all three surfaces**

Run: `npm run dev` (background it).

Using the Playwright MCP tools (or an equivalent browser-automation tool, noting explicitly which one if Playwright's MCP is unavailable):

- Marketing hero (1440×900): screenshot, confirm the glow still looks the same as before this task (same subtle amber-top/green-corner positions and intensity) — this is a refactor, not a visual change, so any difference here is a regression to investigate, not an expected outcome.
- Guide dashboard (enter via demo code `HOKKAIDO` → "I'm the guide"): screenshot, confirm a subtle amber glow is visible near the top of the screen, coexisting with the existing `.gd-contours` topographic rings (both should be visible — the glow is a background color wash, the contours are line art on top of it, they should layer cleanly, not visually clash).
- Traveler home (switch to "Traveler view" from the same session, or fresh via the trip-code gate): screenshot, confirm a subtle amber glow (using Traveler's own darker `--amber-700`) is visible near the top of the screen against the light paper background — this is the one combination not visually verified during planning (color-mix against a light `--bg` for the first time), so look carefully for it being either invisible (too subtle against light paper) or too strong/muddy; if either, note it in your report rather than silently adjusting the percentages — this is exactly the kind of thing the plan expects to be tuned visually, but flag what you saw and let the review confirm the read before changing values.
- Check `browser_console_messages` at `error` level on all three — expected: none attributable to this change.
- Kill the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add src/marketing/marketing.css src/app/app.css src/app/traveler/Home.tsx
git commit -m "feat: refactor hero glow onto theme colors, extend to Guide and Traveler"
```

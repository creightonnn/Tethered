# Typography refresh + sitewide surface glow — design

## Context

The user shared an external font-pairing roundup (daveyandkrista.com/best-fonts-websites/) and asked for a more distinctive typeface plus a gradient/textured background, applied app-wide. Fetching that article showed it's curated for upscale/boutique brands (wedding sites, luxury retail) — most of the named fonts are paid, foundry-specific faces that don't fit Tethered's established "practical expedition field guide" register (a safety tool, not a luxury brand). It's treated here as inspiration for the *idea* ("look more distinctive"), not a literal font list to adopt.

Investigating the current system surfaced two things worth correcting course on before adding anything new:
1. **A fourth font token, `--font-badge: 'Bevan', 'Domine', serif'`, already exists** and is already live on the Guide dashboard (`.gd-header__eyebrow`, `.gd-gauge__label` in `src/app/app.css` both use it) — it's not unused, as first assumed. The actual inconsistency is narrower: the *marketing* site's equivalent eyebrow labels (`.eyebrow-mkt` in `marketing.css`) use `--font-mono` instead of `--font-badge`, so marketing doesn't match a convention the app already established.
2. **The hero's existing glow** (shipped in a prior session) is hardcoded to marketing's specific amber/green `rgba()` values, not reusable as-is for Guide's or Traveler's own accent colors.

Both are addressed here alongside the actual font swap, rather than shipping the font change in isolation and leaving these two loose ends.

## Goals

1. Replace `--font-display` (currently `'Domine', 'Public Sans', serif'`) with `'Fraunces', 'Domine', serif'` — Domine kept as the fallback (not dropped), so a font-load failure degrades gracefully instead of falling to a generic system serif. This is a single token in `src/styles/tokens.css`, defined once outside any `[data-theme]` block, so it cascades to every headline across marketing, Guide, and Traveler with no other file needing to change — confirmed `src/app/app.css` already references `var(--font-display)` consistently (topbar title, nav buttons, stat-tile values, CTA button, etc.), same as `marketing.css`.
2. Switch `.mkt .eyebrow-mkt` (marketing's eyebrow labels — "For guided group tours," "What actually happened," etc.) from `--font-mono` to `--font-badge`, matching the Guide dashboard's already-established eyebrow convention.
3. Leave `--font-body` (Public Sans) and `--font-mono` (JetBrains Mono) untouched everywhere, including every current mono-styled "data/waypoint" element: `.story__mark` (the "Hokkaido, day 6" beat marks), the showcase compass readout, `.phone__label`, countdown/stat values, and `.trust-line` (confirm this last one's actual content during implementation — if it reads as fine-print/data rather than a badge, it stays mono; if it turns out to be eyebrow-like copy, treat it the same as `.eyebrow-mkt`). These exist specifically to read as instrument/coordinate data, distinct from the "badge" voice — swapping them would blur a distinction that's currently working.
4. Define one reusable, theme-color-driven glow pattern — using `color-mix()` against each theme's own `--accent`/`--primary` custom properties rather than hardcoded `rgba()` — and use it in three places: refactor the marketing hero's existing (hardcoded) glow onto this shared pattern, and add the same restrained top-anchored treatment to the Guide dashboard's top section and the Traveler home's top section, each correctly picking up its own theme's colors automatically.
5. Install Fraunces via Fontsource (same loading convention as every other font in this project — static weight imports in `src/index.css`, not a variable-font/JS-loaded approach), at the weights currently used for Domine (400/500/600/700).

## Non-goals

- No change to `--font-body` (Public Sans) or `--font-mono` (JetBrains Mono) — confirmed with the user (Approach A), both are already deliberate, non-generic choices doing real work.
- No change to the already-shipped grain texture (SVG, opacity, blend mode, per-theme `--grain-opacity` values) — this work is additive to it, not a revision.
- No migration of any currently-mono "data" element to the badge font (see Goal 3's list) — the mono/badge distinction is being reinforced, not erased.
- No literal adoption of any specific font named in the referenced article — none were evaluated as a fit for this brand; Fraunces was chosen independently for its editorial-but-readable character and free/Fontsource availability.
- No new page, section, or component — purely token-level and a handful of existing-class changes across already-shipped surfaces.

## Architecture

**`src/styles/tokens.css`:**
- `--font-display: 'Domine', 'Public Sans', serif;` → `--font-display: 'Fraunces', 'Domine', 'Public Sans', serif;`
- No other font token changes.

**`src/index.css`:**
- Add Fraunces weight imports (`@fontsource/fraunces/400.css`, `/500.css`, `/600.css`, `/700.css`) alongside the existing font imports. Domine's own imports stay — it's still the fallback value in the font stack and may still be referenced directly in the dev-only `BrandBoard.tsx` showcase.
- Requires `npm install @fontsource/fraunces` (new dependency — same publisher/package family as every other font already in this project, so no new licensing or build-tooling concerns).

**`src/marketing/marketing.css`:**
- `.mkt .eyebrow-mkt { font-family: var(--font-mono); ... }` → `var(--font-badge)`.
- The existing hardcoded hero glow (on `.mkt > .mkt-hero-marquee`, added in a prior session) is rewritten to use the shared `color-mix()` pattern described below instead of its current fixed `rgba(232, 161, 58, ...)` / `rgba(43, 100, 76, ...)` values — same visual position and intensity, just sourced from `var(--accent)`/`var(--primary)` so it's no longer marketing-specific hardcoding.

**Shared glow pattern (exact selector/placement is an implementation decision, not fixed here):**
```css
background:
  radial-gradient(ellipse 70% 55% at 50% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%),
  radial-gradient(ellipse 60% 40% at 82% 100%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%),
  var(--bg);
```
This is the same geometry/intensity as the shipped hero glow, just with `color-mix()` substituted for the hardcoded colors — verified `color-mix()` is supported in all evergreen browsers this app already targets (no polyfill or fallback needed, consistent with the project's existing use of modern CSS like `@theme inline` and CSS nesting-free custom properties).

**`src/app/app.css`:**
- Add the same glow pattern to the Guide dashboard's top-level container and to Traveler home's top-level container — exact class names and which container each attaches to is determined during implementation (needs a quick look at `GuideHome.tsx`/traveler `Home.tsx`'s existing top-level markup to attach cleanly without restructuring either component). Both will automatically render in their own theme's `--accent`/`--primary` colors (Guide: amber/green-500; Traveler: darker amber-700/green-600, per `tokens.css`'s existing theme blocks) with no per-theme color values to maintain.

## Data flow

None. Purely presentational — token and CSS-class changes only, no new props, no state, no new components.

## Testing / Verification

Lower-risk category than the recent scroll-animation work (no motion, no viewport-dependent math) — a static visual pass is sufficient:
- `npm run build` + `npm run lint` — must both pass clean.
- Confirm the Fraunces font actually loads (network/computed-style check, not just "the CSS says so" — a font-loading failure silently falls back to Domine, which would look fine but wouldn't be the intended change).
- Visual check at one desktop width on all three surfaces: marketing hero + a section with `.eyebrow-mkt` (confirm headline reads in Fraunces, eyebrow reads in Bevan, glow still renders correctly with the refactored `color-mix()` version), Guide dashboard (confirm headline/button text reads in Fraunces, confirm the new glow renders in Guide's own amber/green), Traveler home (confirm headline reads in Fraunces on the light theme, confirm the new glow is visible-but-subtle against the light paper background — `color-mix()` against a light `--bg` needs an eyeball check since it wasn't verified against a light background before).
- Confirm none of the mono "data" elements (`.story__mark`, compass readout, `.phone__label`, countdown/stat values) changed font — a quick diff-driven check, not a full re-screenshot of every one.
- Mobile check (one narrow viewport) on at least the marketing hero, to confirm Fraunces doesn't behave oddly at the responsive `clamp()`-based headline sizes already in place.

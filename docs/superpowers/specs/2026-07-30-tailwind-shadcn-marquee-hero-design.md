# Tailwind/shadcn animated-marquee hero — design

## Context

The marketing hero (`src/marketing/sections/Hero.tsx`) currently renders the WebGL shader-sky + Three.js flying-787 scene built and polished in the prior session (commit `2040af5` and its predecessors). The user brought a new reference component — `AnimatedMarqueeHero` (a "shadcn-style" hero: tagline, staggered-word title, description, single CTA button, and a bottom-of-viewport infinite-scrolling strip of images, animated with Framer Motion) — and wants it to fully replace the current hero.

This repo has never used Tailwind CSS, shadcn, `components.json`, or Framer Motion. Styling today is a hand-rolled token-based system (`src/styles/tokens.css` + `src/marketing/marketing.css`, BEM-ish `mkt-` prefixed classes), and animation runs on GSAP (`@gsap/react`). The user explicitly chose the **full literal setup** path during brainstorming — actually install Tailwind + shadcn scaffolding and drop the component in close to verbatim — rather than reimplementing the same visual idea against the existing token/GSAP system. This spec covers that literal setup, adapted only where the reference component's assumptions don't match this repo (file paths, `"use client"`, off-brand demo content/colors).

The old hero is being fully removed from the live app. The user confirmed git history (commit `2040af5`) is sufficient to recover it later — no flag, no second route, no dead code kept around "just in case."

## Goals

1. Install Tailwind CSS v4 (via `@tailwindcss/vite`) and the minimal shadcn scaffold (`components.json`, `src/lib/utils.ts` with `cn()`) into this Vite + React 19 + TypeScript project, without disturbing the existing plain-CSS design system used by every other page/surface in the app.
2. Map shadcn's expected semantic Tailwind color tokens (`background`, `foreground`, `card`, `muted-foreground`, `border`) onto the **existing** `tokens.css` marketing-theme CSS variables (`--bg`, `--text`, `--bg-raised`, `--text-muted`, `--line`) instead of introducing a second, parallel color palette.
3. Add `src/components/ui/hero-3.tsx` (the `AnimatedMarqueeHero` component), adapted only for this-repo realities (drop `"use client"`, recolor the CTA to the site's existing amber accent instead of the reference's red).
4. Replace `Hero.tsx`'s body with `<AnimatedMarqueeHero>`, fed Tethered's real copy (current eyebrow/headline/subhead/CTA text) and Unsplash images themed to guided bus tours / group travel / Japan instead of the reference's generic lifestyle photos.
5. Remove `ShaderSky.tsx`, `FlyingPlane.tsx`, `public/plane.glb`, and their now-orphaned hero-scene CSS from `marketing.css`.

## Non-goals

- No reimplementation of the marquee hero against the existing token/GSAP system — the user chose the literal Tailwind/shadcn path.
- No Tailwind `preflight` (base reset) layer — see Architecture below for why.
- No retrofitting Tailwind onto any other page/section of the app. This change touches only what's needed to render one component: the scaffold, the component itself, and `Hero.tsx`.
- No second CTA slot added to the component to fit the old hero's two-button layout — the reference component has one CTA slot; the hero keeps one CTA ("Try the live demo" → `/app`). The dropped second CTA ("Bring it to your tours") already exists in the page's `FinalCTA` section.
- No preserving the old hero behind a flag/route/comment — git history is the agreed recovery path.

## Architecture

**Dependencies added** (`package.json`):
- `tailwindcss`, `@tailwindcss/vite` — Tailwind v4's Vite-native integration, no PostCSS config needed.
- `framer-motion` — used by the reference component's animations (tagline/title/description stagger-in, marquee scroll, button hover/tap).
- `clsx`, `tailwind-merge` — shadcn's standard `cn()` helper dependencies.

**Build/config wiring:**
- `vite.config.ts` — add the `tailwindcss()` plugin and a `resolve.alias` entry mapping `@` → `./src`.
- `tsconfig.app.json` — add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` so `@/components/ui/hero-3` and `@/lib/utils` resolve for both the editor and `tsc`.
- `components.json` — new, standard shadcn config: `aliases.components = "@/components"`, `aliases.ui = "@/components/ui"`, `aliases.utils = "@/lib/utils"`, style/base-color fields set to shadcn's defaults (they only affect scaffolding future `shadcn add` pulls, not this component, since colors are remapped below).
- `src/lib/utils.ts` — new, the standard `cn(...inputs) => twMerge(clsx(inputs))` helper the component imports.

**Tailwind entry & theme mapping** (`src/styles/tailwind.css`, new, imported once from `src/main.tsx`):
```css
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities" layer(utilities);

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text);
  --color-card: var(--bg-raised);
  --color-muted-foreground: var(--text-muted);
  --color-border: var(--line);
}
```
Deliberately omits `@import "tailwindcss/preflight" layer(base);`. Preflight resets default browser element styling (headings, buttons, lists, form controls, etc.) globally; this app's existing plain CSS across the Guide/Traveler/marketing surfaces was never written expecting that reset, so importing it risks visually breaking pages this change isn't supposed to touch. Skipping it means Tailwind utility classes (`flex`, `text-5xl`, `rounded-full`, ...) are available anywhere in the app, scoped to *only* what opts in by using them — no ambient reset.

Because `--bg`/`--text`/`--bg-raised`/`--text-muted`/`--line` are already scoped under `[data-theme='marketing']` in `tokens.css`, and `Landing.tsx` already sets `data-theme="marketing"` on its root, `bg-background`/`text-foreground`/etc. resolve to Tethered's real ink/paper/amber palette with zero new color values defined.

**Component** (`src/components/ui/hero-3.tsx`, new):
- Copied from the reference `hero-3.tsx` with two adaptations:
  - Drop the `"use client"` directive (meaningless in a Vite SPA; no Next.js).
  - `ActionButton`'s classes change from `bg-red-500 ... hover:bg-red-600 focus:ring-red-400` to the mapped brand tokens (`bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] focus:ring-[var(--accent)]`), matching every other primary CTA on the site (`.mkt-btn--primary` in `marketing.css` uses the same `--accent`/`--accent-ink` pair).
  - `AnimatedMarqueeHeroProps` gains one additive field, `onCtaClick?: () => void`, forwarded to `ActionButton`'s `onClick`. The reference component has no way to make its CTA navigate anywhere (`ctaText` is a bare string, `ActionButton` is a plain `<button>` with no click handling) — this is the minimal change needed to make the button do something, versus either leaving it inert or restructuring it into a link.
- Everything else (the props interface's existing fields, Framer Motion variants, the image-marquee structure/masking, `cn()` usage) is unchanged from the reference.

**Hero wiring** (`src/marketing/sections/Hero.tsx`, rewritten):
- Replace the `ShaderSky`/`FlyingPlane`/scrim/content markup with a single `<AnimatedMarqueeHero>` call.
- Props sourced from the current hero's real copy:
  - `tagline`: "For guided group tours"
  - `title`: `<>You're not lost.<br /><em>The bus is this way.</em></>`
  - `description`: the existing Hokkaido paragraph, with "Built to keep working when the signal doesn't." folded in as its closing sentence (the standalone offline-line element has no slot in the new layout).
  - `ctaText`: "Try the live demo", `onCtaClick`: a `react-router-dom` `useNavigate()` call to `/app`, so the CTA still routes client-side rather than hard-navigating.
  - `images`: 8–10 real, URL-verified Unsplash photos themed to bus tours / group travel / Japan (sourced and checked during implementation, not guessed from memory now).

**Cleanup:**
- Delete `src/marketing/ShaderSky.tsx`, `src/marketing/FlyingPlane.tsx`, `public/plane.glb`.
- Remove the now-orphaned `.mkt-hero__scene`, `.mkt-hero__scrim`, `.mkt-hero__shader-sky`, `.mkt-hero__flying-plane`, and related hero-scene rules from `marketing.css`; keep any classes still used elsewhere (verify before deleting).

## Data flow

Entirely static marketing content, same as before — no product/trip data involved. `AnimatedMarqueeHero` takes only the props listed above; no external state, no context providers.

## Testing / Verification

One bounded round:
- Run the dev server, confirm no TypeScript/Vite build errors from the new Tailwind/path-alias config.
- Playwright screenshot the hero at desktop (1440×900) and mobile (375×667): confirm the tagline/title/description/CTA render with Tethered's real copy in the mapped brand colors (dark ink background, amber CTA, paper text) — not shadcn's default gray palette and not the reference's red button.
- Confirm the image marquee scrolls continuously and images load (no broken-image icons — validates the Unsplash URLs picked during implementation).
- Confirm the CTA navigates to `/app` via client-side routing (no full page reload).
- Spot-check one *other* page/surface (e.g. the Guide dashboard or Traveler home) to confirm Tailwind's omitted-preflight setup didn't visually change anything outside the hero.
- Browser console clean of errors.
- Fix anything found in one batch, re-screenshot to confirm, stop — no open-ended polish loop.

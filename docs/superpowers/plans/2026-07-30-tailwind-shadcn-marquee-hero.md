# Tailwind/shadcn Animated-Marquee Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the marketing hero's WebGL shader-sky/3D-plane scene with a Tailwind + shadcn `AnimatedMarqueeHero` component (tagline, staggered title, description, single CTA, animated bottom image marquee), fully wired into this Vite + React 19 + TypeScript project which has never used Tailwind/shadcn before.

**Architecture:** Install Tailwind v4 (via `@tailwindcss/vite`) and a minimal shadcn scaffold (`components.json`, `src/lib/utils.ts`) without importing Tailwind's `preflight` reset layer, so the new utility-class system coexists with the app's existing plain-CSS design system instead of overriding it. Map shadcn's semantic color tokens onto the app's existing `tokens.css` marketing-theme CSS variables so the new component renders in Tethered's real brand colors. Copy the reference component in near-verbatim, wire it into `Hero.tsx` with real copy and verified Unsplash images, then delete the old hero's now-dead code.

**Tech Stack:** Tailwind CSS v4, `@tailwindcss/vite`, Framer Motion, `clsx` + `tailwind-merge` (shadcn's `cn()`), React Router (`useNavigate`).

## Global Constraints

- No `tailwindcss/preflight` import anywhere — Tailwind's base reset must never load, or it will visually break every other page in the app that isn't part of this change. (Spec: Architecture)
- Semantic color tokens (`--color-background`, `--color-foreground`, `--color-card`, `--color-muted-foreground`, `--color-border`) map to the existing `--bg`/`--text`/`--bg-raised`/`--text-muted`/`--line` variables in `src/styles/tokens.css` — no new/duplicate color values defined. (Spec: Goal 2)
- The hero keeps exactly one CTA ("Try the live demo" → `/app`). No second CTA slot is added to the component. (Spec: Non-goals)
- This repo has no test runner (no vitest/jest/testing-library in `package.json`) — verification throughout this plan is `npm run build` (type-check + Vite build), `npm run lint` (oxlint), and Playwright-driven visual checks against the dev server, matching how the prior shader/plane hero work in this repo was verified.
- Old hero recovery path is git history only (commit `2040af5` and earlier) — no flags, no second route, no commented-out code left behind. (Spec: Context)

---

### Task 1: Tailwind v4 + shadcn scaffold

**Files:**
- Modify: `package.json` (via `npm install`, not hand-edited)
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`
- Modify: `src/index.css`
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/styles/tailwind.css`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` exported from `src/lib/utils.ts` — Task 2 imports this as `@/lib/utils`.
- Produces: the `@` → `./src` path alias (both in `vite.config.ts` resolve and `tsconfig.app.json` paths) — Task 2 and Task 3 both import via `@/...`.
- Produces: Tailwind utility classes (`bg-background`, `text-foreground`, `bg-card/50`, `text-muted-foreground`, `border-border`, plus all of Tailwind's standard utilities like `flex`, `text-5xl`, `rounded-full`) available anywhere in the app via `src/styles/tailwind.css`, imported globally from `src/index.css`.

- [ ] **Step 1: Install the new dependencies**

Run: `npm install tailwindcss @tailwindcss/vite framer-motion clsx tailwind-merge`

- [ ] **Step 2: Wire the Tailwind Vite plugin and the `@` path alias into `vite.config.ts`**

Replace the full contents of `vite.config.ts` with:

```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Tethered: stay with your group',
        short_name: 'Tethered',
        description: 'Keeps a tour group together, on and off the bus.',
        theme_color: '#1c2340',
        background_color: '#1c2340',
        display: 'standalone',
        start_url: '/app',
        scope: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The whole point of the product is that the core loop survives with
        // no network — precache the full app shell so /app never needs a
        // live request once it has loaded once.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/$/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/.vs/**', '**/.remember/**', '**/.claude/**'],
    },
  },
})
```

- [ ] **Step 3: Add the `@` path alias to `tsconfig.app.json`**

In `tsconfig.app.json`, inside `compilerOptions`, add `baseUrl` and `paths` right after `"skipLibCheck": true,`:

```json
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
```

- [ ] **Step 4: Create `components.json`**

Create `components.json` at the repo root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 5: Create `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Create `src/styles/tailwind.css`**

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

/*
  Deliberately no `@import "tailwindcss/preflight.css" layer(base);` —
  the `base` layer is declared above (for correct cascade-layer ordering)
  but left empty. Preflight
  resets default browser element styling globally, and every other surface
  in this app (Guide, Traveler, the rest of marketing) was written against
  the un-reset browser defaults. Skipping it keeps Tailwind opt-in: utility
  classes are available anywhere, but nothing changes for elements that
  don't use them.
*/

@theme inline {
  /* Mapped onto the existing marketing-theme tokens in tokens.css instead
     of inventing a second color palette — see [data-theme='marketing'] in
     src/styles/tokens.css. */
  --color-background: var(--bg);
  --color-foreground: var(--text);
  --color-card: var(--bg-raised);
  --color-muted-foreground: var(--text-muted);
  --color-border: var(--line);
}
```

- [ ] **Step 7: Import the new stylesheet from `src/index.css`**

In `src/index.css`, add the import after the `tokens.css` import:

```css
@import './styles/tokens.css';
@import './styles/tailwind.css';
@import './styles/global.css';
```

- [ ] **Step 8: Build and verify Tailwind actually compiled**

Run: `npm run build`
Expected: build succeeds with no errors.

Run: `grep -o -- "--color-background:[^;]*" dist/assets/*.css`
Expected: prints a line containing `--color-background:var(--bg)` (confirms the `@theme inline` mapping made it into the compiled CSS).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.app.json components.json src/lib/utils.ts src/styles/tailwind.css src/index.css
git commit -m "feat: install Tailwind v4 + shadcn scaffold, mapped to existing brand tokens"
```

---

### Task 2: `AnimatedMarqueeHero` component

**Files:**
- Create: `src/components/ui/hero-3.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils` (Task 1).
- Produces: `AnimatedMarqueeHero` React component, exported from `src/components/ui/hero-3.tsx`, with props `{ tagline: string; title: React.ReactNode; description: string; ctaText: string; images: string[]; onCtaClick?: () => void; className?: string }` — Task 3 imports this as `@/components/ui/hero-3`.

- [ ] **Step 1: Create `src/components/ui/hero-3.tsx`**

Adapted from the reference component: no `"use client"` directive (meaningless in a Vite SPA), `ActionButton` recolored from hardcoded red to the mapped brand-amber CSS variables (same ones `.mkt-btn--primary` in `marketing.css` already uses), and one additive prop (`onCtaClick`) so the button can actually navigate — the reference component has no click handling at all.

```tsx
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedMarqueeHeroProps {
  tagline: string
  title: React.ReactNode
  description: string
  ctaText: string
  images: string[]
  onCtaClick?: () => void
  className?: string
}

const ActionButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-8 px-8 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-lg transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-75"
  >
    {children}
  </motion.button>
)

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  onCtaClick,
  className,
}) => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  }

  const duplicatedImages = [...images, ...images]

  return (
    <section
      className={cn(
        'relative w-full h-screen overflow-hidden bg-background flex flex-col items-center justify-center text-center px-4',
        className,
      )}
    >
      <div className="z-10 flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
        >
          {typeof title === 'string'
            ? title.split(' ').map((word, i) => (
                <motion.span key={i} variants={FADE_IN_ANIMATION_VARIANTS} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <motion.div
          className="flex gap-4"
          animate={{
            x: ['-100%', '0%'],
            transition: {
              ease: 'linear',
              duration: 40,
              repeat: Infinity,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 5}deg`,
              }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build to verify it type-checks**

Run: `npm run build`
Expected: succeeds with no TypeScript errors (this file is under `src/`, so `tsc -b` type-checks it even though nothing imports it yet — `tsconfig.app.json`'s `"include": ["src"]` covers every file in the tree).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/hero-3.tsx
git commit -m "feat: add AnimatedMarqueeHero component"
```

---

### Task 3: Wire the new hero into `Hero.tsx` with real content

**Files:**
- Modify: `src/marketing/sections/Hero.tsx` (full rewrite)

**Interfaces:**
- Consumes: `AnimatedMarqueeHero` from `@/components/ui/hero-3` (Task 2), `useNavigate` from `react-router-dom`.
- Produces: `Hero` component, default export shape unchanged (`export function Hero()`), still imported by `src/marketing/Landing.tsx:6` with no changes needed there for this task.

Images are 9 real Unsplash photos (buses, mountain roads, snowy Sapporo streets, bus interiors), each verified to return `HTTP 200` / `image/jpeg` during planning.

- [ ] **Step 1: Replace `src/marketing/sections/Hero.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { AnimatedMarqueeHero } from '@/components/ui/hero-3'

const TOUR_IMAGES = [
  'https://images.unsplash.com/photo-1757983160551-5486507ee797?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1639438415473-a3c25d94cfe1?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1752563247435-8b1ee6107121?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1545972154-9bb223aac798?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1608221621423-8112b3fb7435?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1699341606473-3038483f93c1?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1736156725121-027231636f9d?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1756753103801-76980a5b5979?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1752807604225-ba452b60469f?w=900&auto=format&fit=crop&q=60',
]

export function Hero() {
  const navigate = useNavigate()

  return (
    <AnimatedMarqueeHero
      tagline="For guided group tours"
      title={
        <>
          You're not lost.
          <br />
          <em className="not-italic text-[var(--accent)]">The bus is this way.</em>
        </>
      }
      description="Save a pin while you've still got signal. Lose the signal, keep the way back. Tethered kept an 18-person tour together across Hokkaido — Sapporo malls, a Tokyo airport transfer — with no chat thread and no wifi required. Built to keep working when the signal doesn't."
      ctaText="Try the live demo"
      onCtaClick={() => navigate('/app')}
      images={TOUR_IMAGES}
    />
  )
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Start the dev server and visually verify with Playwright**

Run: `npm run dev` (background it, note the port it prints — Vite falls back to 5174+ if 5173 is busy).

Using the Playwright MCP tools:
- Resize to 1440×900, navigate to the dev server URL, take a screenshot.
- Confirm: dark ink background (not shadcn's default gray), amber CTA button reading "Try the live demo", tagline "For guided group tours", title "You're not lost. / The bus is this way." with the second line in amber, the Hokkaido description paragraph, and a continuously animating strip of the 9 bus/mountain/Sapporo photos at the bottom (no broken-image icons).
- Resize to 375×667, take a screenshot, confirm the same content is legible and the marquee still renders.
- Click the CTA button, confirm the URL changes to `/app` without a full page reload (client-side route change).
- Check `browser_console_messages` at `error` level — expected: none attributable to this change (pre-existing Playwright/extension noise like "Could not establish connection" is fine, matches what was seen in the prior shader/plane work).

- [ ] **Step 4: Commit**

```bash
git add src/marketing/sections/Hero.tsx
git commit -m "feat: wire AnimatedMarqueeHero into the marketing hero with real copy and images"
```

---

### Task 4: Remove the old hero's dead code

**Files:**
- Delete: `src/marketing/ShaderSky.tsx`
- Delete: `src/marketing/FlyingPlane.tsx`
- Delete: `public/plane.glb`
- Modify: `src/marketing/marketing.css`
- Modify: `src/marketing/Landing.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this task only removes code now-unreferenced after Task 3 rewired `Hero.tsx`. `.mkt-btn`/`.mkt-btn--primary`/`.mkt-btn--outline` in `marketing.css` are kept — `src/marketing/sections/FinalCTA.tsx:9` and `:14` still use them.

- [ ] **Step 1: Delete the old hero-scene files**

```bash
git rm src/marketing/ShaderSky.tsx src/marketing/FlyingPlane.tsx public/plane.glb
```

- [ ] **Step 2: Remove the now-orphaned hero-scene CSS from `src/marketing/marketing.css`**

Delete this entire block (starts right after the `.mkt-nav__cta { ... }` rule, ends right before `.mkt-btn {`):

```css
/* -- hero: full-bleed compass scene -- */
.mkt .mkt-hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  padding: 140px 24px 80px;
  max-width: none;
  overflow: hidden;
}

.mkt-hero__scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.mkt-hero__shader-sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.mkt-hero__flying-plane {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mkt-hero__flying-plane canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.mkt-hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    100deg,
    var(--ink-950) 0%,
    rgba(14, 23, 18, 0.88) 32%,
    rgba(14, 23, 18, 0.35) 58%,
    transparent 78%
  );
  pointer-events: none;
}

.mkt-hero__content {
  position: relative;
  z-index: 1;
  max-width: 640px;
}

.mkt-hero__headline {
  font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 1.03;
  font-weight: 600;
  margin: 18px 0 22px;
}

.mkt-hero__headline em {
  font-style: normal;
  color: var(--accent);
}

.mkt-hero__sub {
  font-size: 1.25rem;
  line-height: 1.55;
  color: var(--text-muted);
  max-width: 46ch;
  margin-bottom: 34px;
}

.mkt-hero__ctas {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

```

(Leave exactly one blank line between the preceding `.mkt-nav__cta` rule and the following `.mkt-btn` rule.)

Then delete this second, separate block (right after `.mkt-btn--outline { ... }`, right before the `/* -- section headers -- */` comment):

```css
.mkt-hero__offline {
  margin-top: 22px;
  font-size: 0.95rem;
  color: var(--text-muted);
}

```

(Leave exactly one blank line between `.mkt-btn--outline` and `/* -- section headers -- */`.)

- [ ] **Step 3: Remove the now-dead hero entrance animation from `src/marketing/Landing.tsx`**

In the `useGSAP` callback, replace:

```tsx
          gsap.set('.reveal, .reveal-hero', { autoAlpha: 1, y: 0 })

          if (reduce) return

          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          heroTl
            .fromTo(
              '.reveal-hero',
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 },
            )
            .fromTo(
              '.mkt-hero__scene',
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 1.1 },
              0.1,
            )

          gsap.set('.reveal', { autoAlpha: 0, y: 34 })
```

with:

```tsx
          gsap.set('.reveal', { autoAlpha: 1, y: 0 })

          if (reduce) return

          gsap.set('.reveal', { autoAlpha: 0, y: 34 })
```

(`.reveal-hero` and `.mkt-hero__scene` no longer exist anywhere in the tree after this task — the new hero animates itself via Framer Motion.)

- [ ] **Step 4: Build and lint**

Run: `npm run build`
Expected: succeeds — confirms nothing still imports the deleted `ShaderSky`/`FlyingPlane` files.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Final visual regression pass**

Run: `npm run dev` (background it).

Using the Playwright MCP tools:
- Screenshot the hero again at 1440×900 and 375×667 (same checks as Task 3, Step 3) — confirm nothing changed from removing the dead CSS/GSAP code.
- Navigate to `/app` (the Guide dashboard or Traveler home, whichever loads by default) and take one screenshot — confirm it looks the same as before this whole plan started (proves the no-preflight Tailwind setup didn't leak styling into other surfaces).
- Check `browser_console_messages` at `error` level on both pages — expected: none attributable to this change, and specifically no 404 for `/plane.glb`.

- [ ] **Step 6: Commit**

```bash
git add -u src/marketing/marketing.css src/marketing/Landing.tsx
git commit -m "chore: remove old shader/plane hero now that the marquee hero replaces it"
```

# Pricing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/pricing` page — two tiers (Pro, Operator), FAQ, the site's real trust line, styled with the existing card/button/glow/grain visual language — reachable from a new nav link.

**Architecture:** A new top-level route/component (`src/marketing/Pricing.tsx`), sibling to `Landing.tsx`, reusing the existing `Nav` and `Footer` components and the same local `useGSAP`/`ScrollTrigger.batch('.reveal', ...)` reveal pattern `Landing.tsx` already uses. All visual elements (cards, buttons, glow, typography) reuse existing CSS classes/patterns already established in `marketing.css` rather than introducing a new visual language.

**Tech Stack:** Same as the rest of the marketing site — GSAP/`ScrollTrigger`/`@gsap/react` for the reveal animation, plain CSS (no new dependency).

## Global Constraints

- No real payment processing or billing integration — prices are stated as content, CTAs route to the existing demo (`/app`) or a `mailto:` link, nothing else. (Spec: Non-goals)
- No fabricated trust signals — no invented customer logos, no testimonials beyond the one real Hokkaido story already used elsewhere on the site, no stated money-back guarantee (no real refund policy exists). (Spec: Goal 5, Non-goals)
- No third "Free" tier — the existing live demo at `/app` already serves that role. (Spec: Context, Non-goals)
- Voice: plain, calm, specific — no "unlock/elevate/seamless/revolutionize." Terminology: "trip," "guide," "traveler," "roll-call," "find the bus" (not invented synonyms). (Spec: Architecture)
- Visual language: reuse existing `.magic-card` card recipe, `.mkt-btn`/`.mkt-btn--primary`/`.mkt-btn--outline` buttons, `.eyebrow-mkt`/`.mkt-section-head` header pattern, and the established `color-mix()` glow pattern already used on the hero/Guide/Traveler surfaces — no new visual patterns invented for this page. (Spec: Goal 3, Architecture)
- No changes to the actual product's Guide/Traveler functionality, routes, or state model. (Spec: Non-goals)
- This repo has no test runner — verification is `npm run build`, `npm run lint`, and a Playwright/browser-automation visual pass at desktop and mobile widths.

---

### Task 1: `/pricing` page — route, nav link, content, styling

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/marketing/Nav.tsx`
- Modify: `src/marketing/marketing.css`
- Create: `src/marketing/Pricing.tsx`

**Interfaces:**
- Consumes: `Nav` (from `./Nav`), `Footer` (already exported from `./sections/FinalCTA`) — both unchanged in shape, `Pricing.tsx` just renders them.
- Produces: `Pricing` component, default export from `src/marketing/Pricing.tsx`, rendered at the new `/pricing` route in `src/App.tsx`. Nothing later depends on this task (it's the only task in this plan).

- [ ] **Step 1: Add the `/pricing` route to `src/App.tsx`**

Find:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './marketing/Landing'
import AppShell from './app/AppShell'
import ThemedRoute from './ThemedRoute'
import BrandBoard from './dev/BrandBoard'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/"
          element={
            <ThemedRoute theme="marketing">
              <Landing />
            </ThemedRoute>
          }
        />
        <Route path="/app/*" element={<AppShell />} />
        <Route
          path="/brand-board"
          element={
            <ThemedRoute theme="marketing">
              <BrandBoard />
            </ThemedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

Replace with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './marketing/Landing'
import Pricing from './marketing/Pricing'
import AppShell from './app/AppShell'
import ThemedRoute from './ThemedRoute'
import BrandBoard from './dev/BrandBoard'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/"
          element={
            <ThemedRoute theme="marketing">
              <Landing />
            </ThemedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ThemedRoute theme="marketing">
              <Pricing />
            </ThemedRoute>
          }
        />
        <Route path="/app/*" element={<AppShell />} />
        <Route
          path="/brand-board"
          element={
            <ThemedRoute theme="marketing">
              <BrandBoard />
            </ThemedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 2: Add a "Pricing" link to `src/marketing/Nav.tsx`**

Replace the full file content with:

```tsx
import { Link } from 'react-router-dom'

export function Nav() {
  return (
    <div className="mkt-nav-bar">
      <div className="mkt-nav">
        <div className="mkt-nav__brand">
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="16.5" stroke="var(--amber-500)" strokeWidth="1.6" opacity="0.5" />
            <circle cx="24" cy="24" r="1.8" fill="var(--amber-500)" />
            <path d="M24 24 L32.5 15.5 L27 22.5 Z" fill="var(--amber-500)" />
          </svg>
          Tethered
        </div>
        <div className="mkt-nav__links">
          <Link to="/pricing" className="mkt-nav__link">
            Pricing
          </Link>
          <Link to="/app" className="mkt-nav__cta">
            Try the demo
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add the nav-link CSS to `src/marketing/marketing.css`**

Find:

```css
.mkt-nav__cta {
```

Insert this new block immediately before it (i.e. right after the `.mkt-nav__brand { ... }` rule's closing brace, before `.mkt-nav__cta`):

```css
.mkt-nav__links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mkt-nav__link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
}

.mkt-nav__link:hover {
  color: var(--text);
}

```

- [ ] **Step 4: Add the pricing-page CSS to `src/marketing/marketing.css`**

Add this new block at the end of the file (after the last existing rule):

```css

/* -- pricing page -- */
.pricing-hero {
  padding: 140px 24px 60px;
  max-width: 1180px;
  margin: 0 auto;
  text-align: center;
  /* Same restrained top glow as the marketing hero, .gd, and .trv-home
     (see the hero rule near the top of this file) — color-mix() against
     this theme's own --accent/--primary rather than hardcoded colors. */
  background:
    radial-gradient(ellipse 70% 55% at 50% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%),
    radial-gradient(ellipse 60% 40% at 82% 100%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%),
    var(--bg);
}

.pricing-hero .mkt-section-head {
  margin: 0 auto;
}

.pricing-hero__title {
  font-size: clamp(2.2rem, 4.5vw, 3.2rem);
  font-weight: 600;
  line-height: 1.1;
  margin-top: 10px;
}

.pricing-hero__sub {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 46ch;
  margin: 18px auto 0;
}

.pricing-tiers {
  padding: 40px 24px 80px;
  max-width: 1180px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.pricing-card--featured {
  border-color: var(--accent);
}

.pricing-card__price {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 600;
  margin: 14px 0 4px;
}

.pricing-card__period {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-muted);
}

.pricing-card__note {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 22px;
}

.pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.98rem;
  line-height: 1.5;
}

.pricing-card__features li {
  padding-left: 26px;
  position: relative;
}

.pricing-card__features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 30%, transparent);
}

.pricing-card .mkt-btn {
  margin-top: auto;
  justify-content: center;
}

.pricing-faq {
  padding: 20px 24px 60px;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-faq__list {
  display: grid;
  gap: 28px;
}

.pricing-faq__item h3 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.pricing-faq__item p {
  color: var(--text-muted);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Create `src/marketing/Pricing.tsx`**

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './sections/FinalCTA'
import './marketing.css'

gsap.registerPlugin(ScrollTrigger)

export default function Pricing() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { reduce } = context.conditions as { reduce: boolean }

          gsap.set('.reveal', { autoAlpha: 1, y: 0 })

          if (reduce) return

          gsap.set('.reveal', { autoAlpha: 0, y: 34 })
          ScrollTrigger.batch('.reveal', {
            start: 'top 85%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.08,
                overwrite: true,
              }),
          })
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div className="mkt" ref={root} data-theme="marketing">
      <Nav />

      <section className="pricing-hero">
        <div className="mkt-section-head reveal">
          <p className="eyebrow-mkt">Pricing</p>
          <h1 className="pricing-hero__title">One guide. One trip. Everyone stays together.</h1>
          <p className="pricing-hero__sub">
            Simple, per-guide pricing. No accounts for travelers, no setup
            fees, cancel anytime.
          </p>
        </div>
      </section>

      <section className="pricing-tiers">
        <div className="pricing-grid">
          <div className="magic-card pricing-card pricing-card--featured reveal">
            <p className="eyebrow-mkt">Pro</p>
            <p className="pricing-card__price">
              $39<span className="pricing-card__period">/mo per guide</span>
            </p>
            <p className="pricing-card__note">or $390/yr — about 2 months free</p>
            <ul className="pricing-card__features">
              <li>Unlimited trips</li>
              <li>Up to 25 travelers per trip</li>
              <li>Find the bus — offline GPS bearing, distance, and breadcrumb trail</li>
              <li>Roll call with live headcount</li>
              <li>Today / day-pack: departure countdown, hotel and airport cards</li>
              <li>Guide-to-group announcements</li>
            </ul>
            <Link to="/app" className="mkt-btn mkt-btn--primary">
              Try it free
            </Link>
          </div>

          <div className="magic-card pricing-card reveal">
            <p className="eyebrow-mkt">Operator</p>
            <p className="pricing-card__price">Contact us</p>
            <p className="pricing-card__note">For tour companies running more than one guide</p>
            <ul className="pricing-card__features">
              <li>Everything in Pro</li>
              <li>Multiple guides, one account</li>
              <li>Multiple trips running at once</li>
              <li>Custom branding</li>
              <li>Priority support</li>
            </ul>
            <a href="mailto:hello@tethered.app" className="mkt-btn mkt-btn--outline">
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <section className="pricing-faq">
        <div className="mkt-section-head reveal">
          <p className="eyebrow-mkt">Questions</p>
          <h2>Before you ask</h2>
        </div>
        <div className="pricing-faq__list">
          <div className="pricing-faq__item reveal">
            <h3>How does billing work?</h3>
            <p>
              Pro is billed monthly or yearly, per guide. Cancel anytime —
              you keep access through the end of your current billing
              period.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>Does offline capability change by plan?</h3>
            <p>
              No. Find the bus, roll call, and the day-pack work fully
              offline on every plan — that's the whole point of the
              product, not a feature we'd gate.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>What counts as a trip?</h3>
            <p>
              One trip code, one group, start to finish — a single
              multi-day tour, however many stops it has.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>Do travelers need to pay or sign up?</h3>
            <p>
              No. Travelers join with a code the guide reads out loud — no
              account, no download beyond installing the app to their
              home screen if they want to.
            </p>
          </div>
        </div>
      </section>

      <p className="trust-line reveal">
        Tested on a real 11-day Hokkaido tour. Eighteen travelers, two
        guides, seven hotels, one Sapporo afternoon that made the case for
        this.
      </p>

      <Footer />
    </div>
  )
}
```

Notes for the implementer:
- `.magic-card` (the base card recipe: raised background, border, rounded corners, padding) is reused directly via className, alongside the new `.pricing-card`/`.pricing-card--featured` classes that add pricing-specific layout (flex column, left-aligned text, the featured tier's accent border). This is the "same style as the cards" the user asked for, not a new visual pattern.
- `.trust-line` and `.eyebrow-mkt` are pre-existing classes (already used elsewhere on the site, e.g. `src/marketing/sections/Audience.tsx` and `src/marketing/sections/Problem.tsx`) — reused verbatim, not modified.
- The `mailto:hello@tethered.app` address matches the one already used in `src/marketing/sections/FinalCTA.tsx` — same address, not a new one.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings in unrelated files are fine, matching the bar used throughout this project).

- [ ] **Step 8: Verify with Playwright — desktop and mobile**

Run: `npm run dev` (background it, note the port it prints).

Using the Playwright MCP tools (or an equivalent browser-automation tool if Playwright's MCP connection is unavailable — note explicitly which tool you used):

- Navigate to the marketing page (`/`) at 1440×900. Click the new "Pricing" nav link. Confirm it navigates client-side (no full page reload) to `/pricing`.
- On `/pricing` at 1440×900: screenshot. Confirm the page header shows the glow (subtle amber-top/green-corner wash, same character as the hero's), the two tier cards render side by side with the `.magic-card` visual treatment (raised surface, border, rounded corners) and the Pro card's border reads in the accent color, the FAQ renders below, and the trust line + footer appear at the bottom.
- Click "Try it free" on the Pro card — confirm it navigates to `/app` client-side.
- Confirm "Talk to us" on the Operator card is an `<a href="mailto:hello@tethered.app">` (check the DOM/attribute directly — clicking a mailto link in a headless browser won't open a mail client, so verify via the href attribute instead of trying to click through).
- At 375×667: screenshot. Confirm the two tier cards stack to a single column (per the `@media (max-width: 900px)` rule), nothing overlaps or clips, the nav's new "Pricing" link doesn't break the nav bar's layout.
- Check `browser_console_messages` at `error` level at both viewports — expected: none attributable to this change (pre-existing extension noise is fine, matching the bar used throughout this project).
- Kill the dev server when done.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/marketing/Nav.tsx src/marketing/marketing.css src/marketing/Pricing.tsx
git commit -m "feat: add pricing page"
```

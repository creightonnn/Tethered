# Pricing page — design

## Context

Tethered is preparing to present itself as launch-ready. Part of that is a pricing page — explicitly not required to process real payments (no backend/billing exists yet, out of scope per `PRODUCT.md`), just to outline what the product would cost, in the same voice and visual language as the rest of the marketing site.

`PRODUCT.md` already supplies the business context a pricing exercise would normally need to gather: this is a B2B tool sold to tour guides/operators (travelers join free, by code, no accounts — that's explicitly out of scope for them). Usage is inherently trip-based. There's exactly one real piece of evidence to draw on (the 18-traveler, 11-day Hokkaido tour) and an explicit instruction not to fabricate testimonials, logos, or policies that don't exist.

One existing asset changes the shape of this page versus a typical SaaS pricing page: Tethered already has a fully working, no-signup interactive demo (`/app`, code `HOKKAIDO`). That already serves the "try before you buy" role most pricing pages solve with a Free tier — so this page uses two real paid tiers plus a pointer to the existing demo, rather than a third, redundant free tier.

## Goals

1. A new, dedicated `/pricing` route (not a section folded into the one-page landing scroll) — the existing nav has no anchor-scroll links to disrupt, and pricing has enough content (two tiers, comparison, FAQ) to earn its own page, matching how most B2B SaaS sites structure it.
2. Add a "Pricing" link to `Nav.tsx` (currently just the brand mark and a single "Try the demo" CTA) so the new page is actually reachable.
3. Two pricing tiers, styled visually the same as the site's existing card language (`.magic-card`/`.audience-card` — raised surface, bordered, rounded), not a new visual pattern:
   - **Pro** — $39/mo per guide (or $390/yr, ~17% off, standard annual-discount convention), unlimited trips, up to 25 travelers per trip (grounded in the real Hokkaido story's headcount, not an arbitrary number), every capability the product actually has today (find the bus, roll call, day-pack, announcements). CTA "Try it free" → routes to `/app`.
   - **Operator** — "Contact us" / custom pricing, everything in Pro plus multiple guides under one account, multiple simultaneous trips, custom branding, priority support — worded as directional/future capability (a sales conversation), not a promise that a team dashboard exists in the product today. CTA "Talk to us" → `mailto:hello@tethered.app` (the same address `FinalCTA.tsx` already uses — reused, not a new one invented).
4. A short FAQ addressing real, obvious questions a prospective buyer would have: billing cadence, cancellation, whether offline capability is limited on any tier, what counts as "a trip."
5. The same real trust line already used elsewhere on the site ("Tested on a real 11-day Hokkaido tour...") rather than any fabricated customer logos, testimonials, or a money-back-guarantee callout — `PRODUCT.md` is explicit that no other evidence exists, and stating a guarantee with no real refund policy behind it would be the same category of fabrication.
6. A subtle top-anchored glow on the page header, using the same `color-mix()`-against-theme-tokens pattern already established for the hero/Guide/Traveler surfaces (confirmed with the user) — plus the grain texture, which is already global and needs no page-specific work.

## Non-goals

- No real payment processing, checkout flow, or billing integration — this page states prices and routes to existing contact/demo mechanisms only.
- No new accounts/login system — out of scope per `PRODUCT.md`, unaffected by this page.
- No fabricated trust signals: no invented customer logos, testimonials beyond the one real Hokkaido story, or a stated guarantee/refund policy that doesn't exist.
- No third "Free" tier — the existing live demo already fills that role; duplicating it would be redundant and would undersell the demo that already exists.
- No changes to the actual product's Guide/Traveler functionality, routes, or state model.
- No new visual language for the tier cards — reuses the existing card styling, not a new component pattern.

## Architecture

**New route:** `/pricing`, added to `src/App.tsx` alongside the existing `/` and `/brand-board` routes, wrapped in `<ThemedRoute theme="marketing">` (identical pattern to how those two routes are already wired).

**New component:** `src/marketing/Pricing.tsx` — a full page component (not a section nested inside `Landing.tsx`), reusing `<Nav />` (from `src/marketing/Nav.tsx`, gets a new "Pricing" link — see below) and `<Footer />` (already exported from `src/marketing/sections/FinalCTA.tsx`) for consistent site chrome. Owns its own scoped `useGSAP`/`ScrollTrigger.batch('.reveal', ...)` wiring, mirroring the exact pattern already in `Landing.tsx` (`gsap.matchMedia` for `prefers-reduced-motion`, `.reveal` class fade-in) — duplicated locally rather than shared, since `Pricing` is a sibling top-level route to `Landing`, not a section within it.

**Nav change:** `src/marketing/Nav.tsx` gets one new `<Link to="/pricing">Pricing</Link>`, styled consistently with the existing `mkt-nav__cta` treatment or a plain nav-link style (exact class TBD at implementation — this is a one-line, low-risk addition either way).

**Tier cards:** reuse `.magic-card`'s existing recipe (`background: var(--bg-raised); border: 1px solid var(--line); border-radius: 20px; padding: 28px 24px;`) as the base, with pricing-specific internal structure (tier name, price, feature list, CTA button using the existing `.mkt-btn`/`.mkt-btn--primary`/`.mkt-btn--outline` classes already used by `FinalCTA.tsx`) — not a new visual language, an application of the existing one to new content.

**Glow:** the page header gets the same `background: radial-gradient(..., color-mix(in srgb, var(--accent) 14%, transparent), ...), radial-gradient(..., color-mix(in srgb, var(--primary) 16%, transparent), ...), var(--bg);` pattern already used on the marketing hero, `.gd`, and `.trv-home` — applied to a new scoped class on the pricing page's header section, using the marketing theme's own `--accent`/`--primary` tokens (same mechanism, new selector). The grain texture requires no page-specific work — it's a global `body::before` overlay already covering every route.

**Content voice:** plain, calm, specific — no "unlock/elevate/seamless/revolutionize" (per `PRODUCT.md`'s explicit brand-voice constraint), consistent terminology ("trip," "guide," "traveler," "roll-call," "find the bus" — not invented synonyms).

## Data flow

None. Static marketing content — no props beyond what's hardcoded in the page, no state, no data fetching. The two CTA buttons are plain links (`/app` client-side route, `mailto:` external link) — no form submission, no backend call.

## Testing / Verification

Same bar as prior marketing-surface work in this project:
- `npm run build` + `npm run lint` — must both pass clean (no test runner in this repo).
- Playwright/browser-automation visual pass at desktop (1440×900) and mobile (375×667): confirm the page renders with the two tier cards, correct copy, working nav link, glow visible but subtle, grain present (inherited automatically), Fraunces/Bevan typography consistent with the rest of the site.
- Confirm both CTAs actually navigate/open correctly: "Try it free" → `/app` via client-side routing, "Talk to us" → `mailto:hello@tethered.app`.
- Confirm the new nav link doesn't break the existing nav's layout at any tested width.
- Browser console clean of errors (pre-existing extension noise excepted, matching the bar used throughout this project).

# Tour-guide demo polish — design

## Context

The user is preparing to pitch Tethered to a real tour guide. The original ask (see chat history) described building a throwaway demo from a fresh Vite+Tailwind+shadcn scaffold. Investigation found that this project already contains a substantial, working build of the real app (`src/app/**`) that covers nearly the entire scenario: seeded Hokkaido/Sapporo trip data (18 travelers, 2 guides), roll-call with a demo `simulateCheckIns` helper, departure countdown, bus-pin drop, meeting points, announcements, a `FindBus` compass screen with real GPS/compass hooks and a `useDemoWalk` walk-away simulator, a bilingual hotel/airport day-pack, and a deliberate, restrained navy/amber/paper design-token system (`src/styles/tokens.css`, `src/app/app.css`) with GSAP already installed and retiree-friendly floors already met (≥64px tap targets, ≥18px body text via `--tap-min`/typography rules).

Decision (confirmed with user): **extend this real app** rather than scaffold a separate demo project, and use 21st.dev for layout inspiration only, hand-translated into the existing CSS token system rather than adopting Tailwind/shadcn.

## Goals

Add the pieces that are genuinely missing for the pitch:

1. A real skeleton map (MapLibre GL) in `FindBus` showing the bus pin, a "you are here" dot, a route line, and the existing arrow/distance overlay on top.
2. A manual "simulate losing signal" toggle, distinct from the existing real `navigator.onLine`-driven `OfflineBadge`, that authentically demonstrates the map/arrow/distance continuing to work once tiles are already loaded.
3. A frictionless guide ⇄ traveler view toggle so the guide can show both sides in one sitting, without re-entering the join code.
4. A denser, dashboard-style visual pass on the guide console (stat tiles for roll-call count, departure, pin status) — informed by 21st.dev component layouts, rebuilt against the existing tokens/`.card`/`.btn` classes.
5. A few tasteful GSAP touches (countdown tick, arrow easing, roll-call count-up) — nothing beyond that.

## Non-goals

- No new project scaffold, no Tailwind, no shadcn components committed as-is.
- No real offline tile caching / service worker changes. The already-loaded MapLibre tiles simply keep rendering when the manual toggle flips — this matches both the original demo prompt's honest scope note and the existing PRODUCT.md stance that map-tile dependency is a bonus layer, never the core offline promise.
- No backend, auth, or real push notifications — none exist today and none are being added.
- No change to the `TripProvider`/localStorage persistence model.

## Architecture

**Map.** Add `maplibre-gl` as a dependency. New `MapView` component in `src/app/components/MapView.tsx`: a thin wrapper that mounts a MapLibre instance against the free, keyless OpenFreeMap "Bright" style, centered on `trip.busPin`. It renders three sources/layers: bus-pin marker, you-are-here marker (from the existing `position` state already computed in `FindBus`/`MeetingPoint`), and a GeoJSON line between them. The existing big arrow + distance readout stay exactly as they are today (`CompassArrow`, `lib/geo.ts` calculations) and are layered as an HTML overlay on top of the map canvas — the map is spatial context, not a replacement for the arrow.

**Signal-loss simulation.** A new local toggle (component state in `FindBus`, mirrored wherever the map appears) flips a "simulated offline" flag. When active: the connectivity badge shows offline copy, but position (real GPS or `useDemoWalk`), compass heading, distance math, and the MapLibre map (tiles already fetched into the browser's cache/MapLibre's internal cache for the visible viewport) all keep working unchanged. This is intentionally separate from the existing real `useOnlineStatus`/`OfflineBadge` browser-event logic and from the existing "simulate walking away" `useDemoWalk` feature — those are untouched.

**View toggle.** A small pill control (new `RoleToggle` component, placed in `TopBar` or as a persistent strip in `AppShell`) calls the existing `TripProvider` role setter directly to flip between `guide` and `traveler`, instead of routing through `Join`. No new state model — reuses `role`/`join` already in `TripProvider`, just adds a direct setter path that skips code entry (this is a demo/pitch affordance, consistent with the app's existing "Switch role (demo)" link, just frictionless in both directions).

**Guide dashboard polish.** Redesign `GuideHome` (and lightly, `GuideRollCall`) into a stat-tile grid — big roll-call count tile, departure tile, pin-status tile — sitting above the existing action list. Use 21st.dev to generate/iterate on layout ideas, then hand-port the result to the existing `.card`, `.btn`, and token classes in `app.css` rather than importing Tailwind utility classes. No new design system is introduced.

**Motion.** Light GSAP: ease the compass arrow rotation with `gsap.to()` instead of the current CSS transition, a tick/scale pulse on the countdown digits when the value changes, and a count-up tween on the roll-call tally. Respect `prefers-reduced-motion` via `gsap.matchMedia()`, matching the `gsap-core` skill's guidance.

## Data flow

Unchanged. `TripProvider` + `localStorage` remains the single source of truth for trip state (pin, departure, announcement, roster, roll-call). The connectivity-simulation flag and the view-toggle are transient UI state, not persisted trip data — they're pitch mechanics, not trip facts.

## Testing / Self-QA

Using the Playwright MCP, at a 375×667 viewport:
- Screenshot the guide dashboard, `FindBus` (normal state and simulated-signal-lost state), `GuideRollCall`, traveler `Home`, `Today`, and `Announce`.
- Check for overlapping elements, tap targets under 64px, low contrast, and any screen without one clear primary action (the accessibility floor already stated in PRODUCT.md).
- Confirm tapping "I'm here" on the traveler `RollCall` screen updates the guide's `GuideRollCall` tally (same-browser/localStorage, consistent with the existing `simulateCheckIns` demo pattern).
- Confirm the map, arrow, and distance keep rendering/updating correctly with the "simulate losing signal" toggle on.
- Fix anything found, re-screenshot to confirm, and report the final screenshots.

## Open implementation questions for the plan

- Exact MapLibre style URL/version pin for OpenFreeMap and how markers are drawn (DOM markers vs. GeoJSON symbol layers) — resolve during planning/implementation, not a product decision.
- Whether `RoleToggle` is visible only in a "demo mode" or always-on — default to always-on since the whole app is currently demo/localStorage-only anyway.

# Tour-Guide Demo Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real skeleton map, a signal-loss simulation, a frictionless guide/traveler view toggle, and a dashboard-style visual pass to the existing Tethered app (`C:\Users\creig\source\repos\Travel Agency App`) so a real tour guide finds the pitch believable.

**Architecture:** Extend the existing Vite + React 19 + TypeScript app in place — no new project, no Tailwind. New pieces (MapLibre map, stat tiles, role toggle) are built as small components against the existing `src/styles/tokens.css` design-token system and `src/app/app.css` class patterns (`.card`, `.btn`, `.eyebrow`, etc.), reusing `TripProvider`/`localStorage` for all state exactly as today.

**Tech Stack:** React 19, TypeScript, Vite, `maplibre-gl` (new dependency, OpenFreeMap tiles — free, keyless), GSAP + `@gsap/react` (already a dependency), oxlint, `tsc -b`.

## Global Constraints

- No Tailwind, no shadcn components committed as-is — 21st.dev is used only for layout inspiration, then hand-ported to the existing token/class system.
- No real offline tile caching or service worker changes — the "simulate losing signal" toggle only flips a visual indicator; GPS, compass, distance math, and already-loaded map tiles keep working unchanged.
- No backend, auth, or push notifications.
- No change to the `TripProvider`/`localStorage` persistence model — new toggles are transient UI state.
- Accessibility floor (from `PRODUCT.md`, already met by the existing app and must not regress): body text ≥18px, tap targets ≥64px (`--tap-min`) with generous spacing, high contrast, one primary action per traveler screen, no jargon.
- This project has no test runner configured (`package.json` has no `test` script) and this is a visual/interactive demo — verification per task is: `npm run build` (type-check + build), `npm run lint` (oxlint), and a Playwright MCP screenshot check at a 375×667 viewport. Do not introduce a new test framework for this work.
- This directory is not yet a git repository. Task 0 initializes one so the rest of the plan's commit steps work.

---

### Task 0: Initialize git

**Files:**
- Create: `.git/` (via `git init`)

- [ ] **Step 1: Initialize the repository and make a baseline commit**

```bash
git init
git add -A
git commit -m "chore: baseline commit before tour-guide demo polish"
```

- [ ] **Step 2: Verify**

```bash
git log --oneline
```

Expected: one commit, working tree clean per `git status`.

---

### Task 1: Skeleton map in Find the Bus

**Files:**
- Modify: `package.json` (add `maplibre-gl` dependency)
- Create: `src/app/components/MapView.tsx`
- Modify: `src/app/app.css` (add `.map-view`, `.map-marker` rules)
- Modify: `src/app/traveler/FindBus.tsx:1-20, 56-60` (import + render `MapView`)

**Interfaces:**
- Produces: `MapView` component — `function MapView({ busPin, position, height }: { busPin: LatLng; position: LatLng | null; height?: number }): JSX.Element`. Later tasks don't depend on this, but Task 2 renders inside the same `FindBus` screen.

- [ ] **Step 1: Install `maplibre-gl`**

```bash
npm install maplibre-gl@^6.0.0
```

- [ ] **Step 2: Create the map component**

Create `src/app/components/MapView.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LatLng } from '../../lib/geo'

// Free, keyless vector tiles — no API key needed, matches the app's
// muted paper/navy palette better than a saturated default style.
const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

const EMPTY_LINE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
}

function lineTo(a: LatLng, b: LatLng): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [a.lng, a.lat],
        [b.lng, b.lat],
      ],
    },
  }
}

export function MapView({
  busPin,
  position,
  height = 240,
}: {
  busPin: LatLng
  position: LatLng | null
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const meMarkerRef = useRef<maplibregl.Marker | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [busPin.lng, busPin.lat],
      zoom: 15,
    })
    mapRef.current = map

    const busEl = document.createElement('div')
    busEl.className = 'map-marker map-marker--bus'
    new maplibregl.Marker({ element: busEl })
      .setLngLat([busPin.lng, busPin.lat])
      .addTo(map)

    map.on('load', () => {
      map.addSource('route-line', { type: 'geojson', data: EMPTY_LINE })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        paint: {
          'line-color': '#c9822a',
          'line-width': 3,
          'line-dasharray': [1, 1.4],
        },
      })
      readyRef.current = true
    })

    return () => {
      readyRef.current = false
      map.remove()
      mapRef.current = null
      meMarkerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busPin.lat, busPin.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position || !readyRef.current) return

    if (!meMarkerRef.current) {
      const meEl = document.createElement('div')
      meEl.className = 'map-marker map-marker--me'
      meMarkerRef.current = new maplibregl.Marker({ element: meEl })
        .setLngLat([position.lng, position.lat])
        .addTo(map)
    } else {
      meMarkerRef.current.setLngLat([position.lng, position.lat])
    }

    const source = map.getSource('route-line') as maplibregl.GeoJSONSource
    source.setData(lineTo(position, busPin))

    const bounds = new maplibregl.LngLatBounds()
    bounds.extend([position.lng, position.lat])
    bounds.extend([busPin.lng, busPin.lat])
    map.fitBounds(bounds, { padding: 48, maxZoom: 17, duration: 400 })
  }, [position, busPin])

  return <div ref={containerRef} className="map-view" style={{ height }} />
}
```

- [ ] **Step 3: Add map styles**

In `src/app/app.css`, add after the `.compass__note` rule (end of the "find the bus" section, before "-- roll call --"):

```css
.map-view {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1.5px solid var(--line);
  margin-bottom: 18px;
}

.map-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid var(--paper-100);
  box-shadow: 0 2px 6px rgba(28, 35, 64, 0.35);
}

.map-marker--bus {
  background: var(--amber-600);
}

.map-marker--me {
  background: var(--navy-700);
}
```

- [ ] **Step 4: Render the map in Find the Bus**

In `src/app/traveler/FindBus.tsx`, add the import next to the other component imports:

```tsx
import { MapView } from '../components/MapView'
```

Then render it right after `<OfflineBadge />` (currently line 59) and before the `<div className="compass">` block:

```tsx
      <OfflineBadge />

      <MapView busPin={pin} position={position} />

      <div className="compass">
```

- [ ] **Step 5: Type-check, lint, and build**

```bash
npm run build
npm run lint
```

Expected: both succeed with no errors.

- [ ] **Step 6: Visual verification**

```bash
npm run dev
```

(run in background). Then, using the Playwright MCP: navigate to `http://localhost:5173/app`, resize the page to 375×667, enter trip code `HOKKAIDO`, tap "Join the trip" (traveler), tap "Find the bus", and screenshot the result. Confirm: a muted grayscale map renders with an amber bus-pin dot and (once geolocation resolves — grant location permission if prompted, or note it may stay "Finding your position…" in a non-browser test context) a navy "you are here" dot connected by a dashed line, sitting above the existing arrow/distance readout, inside a rounded card matching the app's existing corners.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/app/components/MapView.tsx src/app/app.css src/app/traveler/FindBus.tsx
git commit -m "feat: add MapLibre skeleton map to Find the Bus"
```

---

### Task 2: Manual "simulate losing signal" toggle

**Files:**
- Modify: `src/app/components/OfflineBadge.tsx:20-51`
- Modify: `src/app/traveler/FindBus.tsx` (add state + toggle button)

**Interfaces:**
- Consumes: nothing new from earlier tasks.
- Produces: `OfflineBadge` now accepts an optional `forceOffline?: boolean` prop.

- [ ] **Step 1: Make `OfflineBadge` accept a forced-offline override**

In `src/app/components/OfflineBadge.tsx`, change the component signature and guard:

```tsx
export function OfflineBadge({ forceOffline = false }: { forceOffline?: boolean }) {
  const online = useOnlineStatus()
  if (online && !forceOffline) return null
  return (
```

(The rest of the function body — the `role="status"` div and its contents — stays exactly as-is.)

- [ ] **Step 2: Add the toggle to Find the Bus**

In `src/app/traveler/FindBus.tsx`, add state near the top of the component (after the existing `useState` for `trailLength`):

```tsx
  const [simulateOffline, setSimulateOffline] = useState(false)
```

Update the `<OfflineBadge />` render call from Task 1 to pass the flag:

```tsx
      <OfflineBadge forceOffline={simulateOffline} />
```

Add a toggle button inside the existing "Demo mode" block, right after the "Simulate walking away" / "Stop simulated walk" button pair and before "Reset demo walk":

```tsx
            <Button
              variant="secondary"
              block
              onClick={() => setSimulateOffline((v) => !v)}
            >
              {simulateOffline ? 'Restore signal' : 'Simulate losing signal'}
            </Button>
```

- [ ] **Step 3: Type-check, lint, and build**

```bash
npm run build
npm run lint
```

Expected: both succeed.

- [ ] **Step 4: Visual verification**

With `npm run dev` running, use the Playwright MCP at 375×667 on the Find the Bus screen: tap "Simulate losing signal" and screenshot. Confirm the "No signal, still working" badge appears while the map, arrow, and distance readout are unchanged and still rendering. Tap "Restore signal" and confirm the badge disappears (assuming the real connection is online).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/OfflineBadge.tsx src/app/traveler/FindBus.tsx
git commit -m "feat: add manual signal-loss simulation toggle"
```

---

### Task 3: Frictionless guide/traveler view toggle

**Files:**
- Modify: `src/lib/TripProvider.tsx:34-50, 76, 152-172` (add `switchRole`)
- Create: `src/app/components/RoleToggle.tsx`
- Modify: `src/app/AppShell.tsx:1-2, 36-39`
- Modify: `src/app/app.css` (add `.role-toggle` rules)

**Interfaces:**
- Consumes: `useTrip()` from `src/lib/TripProvider.tsx`.
- Produces: `TripContextValue.switchRole(role: 'traveler' | 'guide'): void`. `RoleToggle` component, no props.

- [ ] **Step 1: Add `switchRole` to `TripProvider`**

In `src/lib/TripProvider.tsx`, add to the `TripContextValue` interface (after `leave: () => void`):

```ts
  switchRole: (role: 'traveler' | 'guide') => void
```

Add the implementation (after the existing `leave` callback, around line 76):

```ts
  const switchRole = useCallback((nextRole: 'traveler' | 'guide') => {
    setRole(nextRole)
  }, [])
```

Add it to the context value object (alongside `leave`):

```ts
        leave,
        switchRole,
```

- [ ] **Step 2: Create `RoleToggle`**

Create `src/app/components/RoleToggle.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'

export function RoleToggle() {
  const { role, switchRole } = useTrip()
  const navigate = useNavigate()

  if (!role) return null

  function go(next: 'traveler' | 'guide') {
    if (next !== role) {
      switchRole(next)
      navigate('/app')
    }
  }

  return (
    <div className="role-toggle" role="tablist" aria-label="Demo view">
      <button
        type="button"
        role="tab"
        aria-selected={role === 'traveler'}
        className="role-toggle__btn"
        data-active={role === 'traveler'}
        onClick={() => go('traveler')}
      >
        Traveler view
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={role === 'guide'}
        className="role-toggle__btn"
        data-active={role === 'guide'}
        onClick={() => go('guide')}
      >
        Guide view
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Add role-toggle styles**

In `src/app/app.css`, add near the `.topbar` rules:

```css
.role-toggle {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 999px;
  margin: 0 auto 4px;
  width: fit-content;
}

.role-toggle__btn {
  min-height: var(--tap-min);
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
}

.role-toggle__btn[data-active='true'] {
  background: var(--accent);
  color: var(--navy-950);
}
```

- [ ] **Step 4: Mount `RoleToggle` in `AppShell`**

In `src/app/AppShell.tsx`, import it:

```tsx
import { RoleToggle } from './components/RoleToggle'
```

Wrap the existing `<Routes>` (currently the direct child of `<TripProvider>`):

```tsx
    <TripProvider>
      <RoleToggle />
      <Routes>
```

(Keep the closing `</Routes>` where it is; only `</TripProvider>` needs no change since `RoleToggle` and `Routes` are now siblings inside it.)

- [ ] **Step 5: Type-check, lint, and build**

```bash
npm run build
npm run lint
```

Expected: both succeed.

- [ ] **Step 6: Visual verification**

With `npm run dev` running, use the Playwright MCP at 375×667: join as guide, screenshot the guide dashboard with the toggle visible at the top, tap "Traveler view", confirm it navigates to the traveler Home screen with "Traveler view" now highlighted, then tap "Guide view" to confirm it returns.

- [ ] **Step 7: Commit**

```bash
git add src/lib/TripProvider.tsx src/app/components/RoleToggle.tsx src/app/AppShell.tsx src/app/app.css
git commit -m "feat: add frictionless guide/traveler view toggle"
```

---

### Task 4: Guide dashboard stat tiles

Use the 21st.dev MCP (e.g. its component-search/generation tool) to pull 2-3 "dashboard stat tile" or "ops metrics row" layout ideas before writing this task's CSS, for spacing/hierarchy inspiration only — the component below already implements the app's own token system and is the actual target output; treat any 21st.dev result as a mood board, not code to paste in verbatim (it will be Tailwind/shadcn and won't match `src/styles/tokens.css`).

**Files:**
- Create: `src/app/components/StatTile.tsx`
- Modify: `src/app/guide/GuideHome.tsx` (full rewrite of the render body)
- Modify: `src/app/app.css` (add `.stat-grid`, `.stat-tile` rules)

**Interfaces:**
- Produces: `StatTile` — `function StatTile({ label, value, tone }: { label: string; value: string; tone?: 'neutral' | 'good' | 'warn' }): JSX.Element`.

- [ ] **Step 1: Create `StatTile`**

Create `src/app/components/StatTile.tsx`:

```tsx
export function StatTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'good' | 'warn'
}) {
  return (
    <div className="stat-tile" data-tone={tone}>
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Add stat-tile styles**

In `src/app/app.css`, add near the `.card` rules:

```css
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-tile {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 16px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-tile__label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.stat-tile__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.stat-tile[data-tone='good'] .stat-tile__value {
  color: var(--signal-good);
}

.stat-tile[data-tone='warn'] .stat-tile__value {
  color: var(--signal-warn);
}
```

- [ ] **Step 3: Rewrite `GuideHome`**

Replace the full contents of `src/app/guide/GuideHome.tsx`:

```tsx
import { useTrip } from '../../lib/TripProvider'
import { LinkButton } from '../components/Button'
import { StatTile } from '../components/StatTile'
import { useCountdown } from '../components/Countdown'

export default function GuideHome() {
  const { trip } = useTrip()
  const { display, overdue } = useCountdown(trip.departureAt)
  const checkedIn = trip.roster.filter((m) => m.checkedIn)
  const missing = trip.roster.filter((m) => !m.checkedIn)

  return (
    <div className="screen screen--pad-top">
      <div className="topbar">
        <h1 className="topbar__title">{trip.name}</h1>
      </div>

      <div className="stat-grid">
        <StatTile
          label="Roll call"
          value={
            trip.rollCallActive
              ? `${checkedIn.length} of ${trip.roster.length}`
              : 'Not running'
          }
          tone={
            trip.rollCallActive && checkedIn.length === trip.roster.length
              ? 'good'
              : trip.rollCallActive
                ? 'warn'
                : 'neutral'
          }
        />
        <StatTile
          label={trip.departureLabel}
          value={overdue ? 'Departed' : display}
        />
        <StatTile label="Bus pin" value={trip.busPin ? 'Set' : 'Not set'} />
      </div>

      {trip.rollCallActive && missing.length > 0 && (
        <div className="instruction-callout" style={{ marginBottom: 14 }}>
          Still missing: {missing.map((m) => m.name).join(', ')}
        </div>
      )}

      <div className="stack" style={{ marginTop: 4 }}>
        <LinkButton to="/app/guide/pin" block>
          Set the bus pin
        </LinkButton>
        <LinkButton to="/app/guide/departure" variant="secondary" block>
          Set departure time
        </LinkButton>
        <LinkButton to="/app/guide/meeting-point" variant="secondary" block>
          Set meeting point
        </LinkButton>
        <LinkButton to="/app/guide/announce" variant="secondary" block>
          Post an announcement
        </LinkButton>
        <LinkButton to="/app/guide/roll-call" variant="secondary" block>
          Run roll call
        </LinkButton>
      </div>
    </div>
  )
}
```

(The old "Switch role (demo)" link at the bottom is removed — `RoleToggle` from Task 3 now covers that.)

- [ ] **Step 4: Type-check, lint, and build**

```bash
npm run build
npm run lint
```

Expected: both succeed. (`leave` will now be unused in this file — it has been removed from the destructure above, so `noUnusedLocals` stays satisfied.)

- [ ] **Step 5: Visual verification**

With `npm run dev` running, use the Playwright MCP at 375×667: join as guide, screenshot the dashboard. Confirm: three stat tiles render in a grid above the action list, the roll-call tile reads "Not running" before a roll call starts, and starting a roll call (via "Run roll call" → "Start roll call") then returning to the dashboard shows a live count and, once the demo `simulateCheckIns` helper marks the 2 missing travelers as still out, the "Still missing" callout with their names.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/StatTile.tsx src/app/guide/GuideHome.tsx src/app/app.css
git commit -m "feat: redesign guide dashboard with stat tiles"
```

---

### Task 5: Light GSAP motion polish

**Files:**
- Create: `src/lib/reducedMotion.ts`
- Modify: `src/app/components/CompassArrow.tsx` (full rewrite)
- Modify: `src/app/components/Countdown.tsx:25-45` (`DepartureCountdown`)
- Modify: `src/app/guide/GuideRollCall.tsx:26-30`
- Modify: `src/app/app.css` (drop the now-redundant CSS transition on `.compass__arrow`)

**Interfaces:**
- Produces: `prefersReducedMotion(): boolean` in `src/lib/reducedMotion.ts`.

- [ ] **Step 1: Add the reduced-motion helper**

Create `src/lib/reducedMotion.ts`:

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

- [ ] **Step 2: Ease the compass arrow with GSAP**

Replace the full contents of `src/app/components/CompassArrow.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

gsap.registerPlugin(useGSAP)

export function CompassArrow({
  bearing,
  heading,
  size = 120,
}: {
  bearing: number
  heading: number | null
  size?: number
}) {
  const rotation = bearing - (heading ?? 0)
  const arrowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!arrowRef.current) return
      gsap.to(arrowRef.current, {
        rotation,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power2.out',
        transformOrigin: 'center center',
      })
    },
    { dependencies: [rotation], scope: arrowRef },
  )

  return (
    <div className="compass__arrow" ref={arrowRef}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 8 L74 62 L50 48 L26 62 Z" fill="currentColor" />
      </svg>
    </div>
  )
}
```

Remove the now-redundant CSS transition in `src/app/app.css` — change:

```css
.compass__arrow {
  transition: transform 0.25s var(--ease-out);
  color: var(--accent);
}
```

to:

```css
.compass__arrow {
  color: var(--accent);
}
```

- [ ] **Step 3: Add a tick pulse to the departure countdown**

In `src/app/components/Countdown.tsx`, update the imports at the top:

```tsx
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'
```

Replace the `DepartureCountdown` function body:

```tsx
export function DepartureCountdown({
  label,
  targetIso,
}: {
  label: string
  targetIso: string
}) {
  const { overdue, display } = useCountdown(targetIso)
  const valueRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (!valueRef.current) return
      gsap.fromTo(
        valueRef.current,
        { scale: 1.06 },
        { scale: 1, duration: prefersReducedMotion() ? 0 : 0.35, ease: 'power2.out' },
      )
    },
    { dependencies: [display], scope: valueRef },
  )

  return (
    <div className="countdown">
      <p className="countdown__label">
        {overdue ? 'The group left' : label}
      </p>
      <p className="countdown__value" ref={valueRef}>
        {overdue ? 'already' : display}
      </p>
      {!overdue && (
        <p className="countdown__sub">You've got plenty of time.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Count up the roll-call tally**

In `src/app/guide/GuideRollCall.tsx`, update the imports:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { prefersReducedMotion } from '../../lib/reducedMotion'
```

Inside the component, after `const missing = trip.roster.filter((m) => !m.checkedIn)`, add:

```tsx
  const tallyRef = useRef<HTMLParagraphElement>(null)
  const displayedRef = useRef(checkedIn.length)

  useGSAP(
    () => {
      if (!tallyRef.current) return
      const counter = { val: displayedRef.current }
      gsap.to(counter, {
        val: checkedIn.length,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power1.out',
        onUpdate: () => {
          if (tallyRef.current) {
            tallyRef.current.textContent = `${Math.round(counter.val)} of ${trip.roster.length} here`
          }
        },
        onComplete: () => {
          displayedRef.current = checkedIn.length
        },
      })
    },
    { dependencies: [checkedIn.length], scope: tallyRef },
  )
```

Update the tally paragraph to carry the ref:

```tsx
            <p className="rollcall-tally__count" ref={tallyRef}>
              {checkedIn.length} of {trip.roster.length} here
            </p>
```

- [ ] **Step 5: Type-check, lint, and build**

```bash
npm run build
npm run lint
```

Expected: both succeed.

- [ ] **Step 6: Visual verification**

With `npm run dev` running and OS-level reduced-motion off, use the Playwright MCP: on Find the Bus, use "Simulate walking away" and confirm the arrow eases smoothly rather than snapping. On the guide's roll call screen, tap "Simulate check-ins (demo)" and confirm the tally visibly counts up rather than jumping straight to the final number. On the departure countdown (traveler Home or Today), confirm no visual glitching when the minute value ticks over (may require waiting or is fine to visually confirm the pulse code path only, since triggering a real minute-tick during a manual check is impractical).

- [ ] **Step 7: Commit**

```bash
git add src/lib/reducedMotion.ts src/app/components/CompassArrow.tsx src/app/components/Countdown.tsx src/app/guide/GuideRollCall.tsx src/app/app.css
git commit -m "feat: add tasteful GSAP motion to arrow, countdown, and roll-call tally"
```

---

### Task 6: Full self-QA sweep

**Files:** none (verification-only task; fixes go into whichever files the QA sweep identifies).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Run in background; note the local URL (default `http://localhost:5173/`).

- [ ] **Step 2: Guide-side screenshots**

Using the Playwright MCP: resize to 375×667, navigate to `http://localhost:5173/app`, enter code `HOKKAIDO`, tap "I'm the guide". Screenshot the guide dashboard. Then visit and screenshot: Set the bus pin, Set departure time, Set meeting point, Post an announcement, Run roll call (both the "not started" and "active, after Simulate check-ins" states).

- [ ] **Step 3: Traveler-side screenshots**

Tap "Traveler view" in the role toggle. Screenshot Home. Tap "Find the bus", screenshot the normal state, tap "Simulate losing signal", screenshot the signal-lost state (confirm map/arrow/distance are still visible and updating). Screenshot Today. If a meeting point has been set from the guide side, screenshot Meeting point too.

- [ ] **Step 4: Cross-role roll-call check**

As guide, start a roll call (fresh, not using the "Simulate check-ins" shortcut this time). Switch to traveler view via the role toggle, go to Roll call, tap "I'm here". Switch back to guide view, open Run roll call, and confirm the tally and roster list reflect that check-in immediately (same-tab `TripProvider` state, no reload needed).

- [ ] **Step 5: Review every screenshot against the accessibility floor**

For each screenshot from Steps 2-4, check: no overlapping/clipped elements, no tap target visually under 64px, no low-contrast text (thin gray-on-white), and exactly one clear primary action per traveler screen. Note every violation found.

- [ ] **Step 6: Fix and re-verify**

Fix anything found in Step 5 directly in the relevant component/CSS file. Re-run `npm run build && npm run lint`, restart the dev server if needed, and re-screenshot the affected screens to confirm the fix.

- [ ] **Step 7: Report**

Present the final set of screenshots (guide dashboard, all guide sub-screens, traveler Home, Find the Bus normal + signal-lost, Today, and the cross-role roll-call result) to the user as the demo QA proof.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix: address self-QA findings from tour-guide demo polish pass"
```

(Skip this commit if Step 6 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** Map (Task 1), signal-loss simulation (Task 2), frictionless view toggle (Task 3), guide dashboard stat tiles + missing-names surfacing (Task 4), GSAP motion (Task 5), Playwright self-QA at 375×667 with accessibility checks and cross-role roll-call verification (Task 6) — all five spec goals and the testing section are covered.
- **Type consistency:** `LatLng` (from `lib/geo.ts`) is the shared shape for `MapView`'s `busPin`/`position` props, matching what `FindBus.tsx` already computes. `TripContextValue.switchRole` signature matches its one call site in `RoleToggle.tsx`. `StatTile`'s `tone` union (`'neutral' | 'good' | 'warn'`) matches the `data-tone` CSS selectors added in the same task.
- **No placeholders:** every step above contains complete, real code — no TBD/TODO markers. The one open call left to the implementer (which 21st.dev result to draw inspiration from in Task 4) is explicitly scoped as inspiration-only, not a blocking dependency, and the actual target component is fully specified.

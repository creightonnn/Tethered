# QA Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 2 Important and 3 Minor findings from the pre-launch QA audit (`2026-07-31`): missing input validation on Set Departure, the "Simulate check-ins" demo helper accidentally self-checking-in the presenter, stale default minutes on reopen of two guide forms, no meeting-point status indicator on Guide Home, and no way for a guide to manually check in one specific traveler.

**Architecture:** Five independent, mechanical fixes, each root-caused down to file:line by the QA audit — no design decisions, no new state-management concepts (the manual check-in reuses the `checkIn(id)` function already used by the traveler's own self-check-in). Each fix touches its own file or a tightly related pair, verified against the exact repro steps the audit already established.

**Tech Stack:** No changes — same React 19/TypeScript/GSAP stack as the rest of the app.

## Global Constraints

- Every fix must be verified against the exact repro steps from the QA audit report (`C:\Users\creig\AppData\Local\Temp\claude\C--Users-creig-source-repos-Travel-Agency-App\2c2d12bc-aaff-47ae-84b0-e8d7c36273dc\scratchpad\qa-audit-report.md`), not just "the code looks right now."
- No changes to `src/lib/tripTypes.ts`'s data shape or any function signature already relied on elsewhere (`checkIn`, `setDeparture`, `setMeetingPoint`, `simulateCheckIns` keep their existing signatures — only their internal logic or callers change).
- This repo has no test runner — verification is `npm run build`, `npm run lint`, and a Playwright/browser-automation pass reproducing each original repro step to confirm it's fixed.
- Demo trip code for manual testing: `HOKKAIDO`.

---

### Task 1: Fix Set Departure validation and stale default minutes

**Files:**
- Modify: `src/app/guide/SetDeparture.tsx`

**Interfaces:**
- Consumes: `useTrip()` from `../../lib/TripProvider` (unchanged signature — `trip.departureLabel`, `trip.departureAt`, `setDeparture(label, minutesFromNow)`).
- Produces: nothing new for later tasks — independent of the other 4 tasks.

- [ ] **Step 1: Replace `src/app/guide/SetDeparture.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

/** Minutes remaining until the trip's current departureAt, floored at 1
 * (the field's own minimum) so reopening this screen shows how much time
 * is actually left instead of always resetting to a hardcoded default. */
function minutesRemaining(departureAt: string): number {
  const ms = new Date(departureAt).getTime() - Date.now()
  return Math.max(1, Math.round(ms / 60_000))
}

export default function SetDeparture() {
  const { trip, setDeparture } = useTrip()
  const [label, setLabel] = useState(trip.departureLabel)
  const [minutes, setMinutes] = useState(
    trip.departureAt ? minutesRemaining(trip.departureAt) : 45,
  )
  const navigate = useNavigate()

  const canSave = label.trim().length > 0 && minutes >= 1

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set departure time" />

      <div className="stack">
        <label className="eyebrow" htmlFor="label">
          What travelers see
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.15rem',
            padding: '0 16px',
            color: 'var(--text)',
          }}
        />

        <label className="eyebrow" htmlFor="minutes">
          Minutes from now
        </label>
        <input
          id="minutes"
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.5rem',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            color: 'var(--text)',
          }}
        />

        <Button
          block
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return
            setDeparture(label.trim(), minutes)
            navigate('/app/guide')
          }}
        >
          Save departure time
        </Button>
      </div>
    </div>
  )
}
```

Two changes from the original: (1) `minutes` initializes from `minutesRemaining(trip.departureAt)` when a departure is already set, instead of always `45` — fixes the stale-default-minutes minor finding; (2) the Save button is `disabled={!canSave}` where `canSave` requires a non-empty (trimmed) label and `minutes >= 1`, and the click handler also early-returns on `!canSave` as a second guard — fixes both parts of the Important finding (empty label, non-positive minutes). `label.trim()` is what actually gets saved, so leading/trailing whitespace-only input is correctly treated as empty.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Verify with Playwright — reproduce and confirm both original bugs are fixed**

Run: `npm run dev` (background it). Navigate to `/app`, enter trip code `HOKKAIDO`, click "I'm the guide", go to Guide → Departure.

- **Empty-label repro:** clear the "What travelers see" field entirely. Confirm the "Save departure time" button is now disabled (check the `disabled` attribute/`aria-disabled`, not just visual appearance) and cannot be clicked/activated. Type a single space only — confirm still disabled (trimmed check). Type real text — confirm it becomes enabled.
- **Negative/zero-minutes repro:** with a valid label, set minutes to `0`. Confirm Save is disabled. Set minutes to `-3`. Confirm Save is disabled. Set minutes to `5`. Confirm Save is enabled and, on click, navigates to Guide Home with the countdown showing a sensible future time (not "Departed").
- **Stale-default-minutes repro:** save a departure with minutes `10`. Navigate away (Guide Home) then back into Departure. Confirm the minutes field shows a number close to `10` (allow for a small amount of real elapsed time during navigation, e.g. `8-10` is correct, `45` would mean the fix didn't work).
- Check `browser_console_messages` at `error` level — expected: none attributable to this change.
- Kill the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/app/guide/SetDeparture.tsx
git commit -m "fix: validate departure form input and show remaining time on reopen"
```

---

### Task 2: Fix stale default minutes on Set Meeting Point

**Files:**
- Modify: `src/app/guide/SetMeetingPoint.tsx`

**Interfaces:**
- Consumes: `useTrip()` — `trip.meetingPoint?.time` (unchanged shape).
- Produces: nothing new — independent of the other 4 tasks.

- [ ] **Step 1: Replace `src/app/guide/SetMeetingPoint.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { useGeolocation } from '../../lib/useGeolocation'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

/** Same reasoning as SetDeparture.tsx's minutesRemaining: show time
 * actually left on the current meeting point instead of always resetting
 * to a hardcoded default when this screen is reopened. */
function minutesRemaining(time: string): number {
  const ms = new Date(time).getTime() - Date.now()
  return Math.max(1, Math.round(ms / 60_000))
}

export default function SetMeetingPoint() {
  const { trip, setMeetingPoint } = useTrip()
  const { position, error } = useGeolocation(true)
  const [label, setLabel] = useState(trip.meetingPoint?.label ?? '')
  const [minutes, setMinutes] = useState(
    trip.meetingPoint?.time ? minutesRemaining(trip.meetingPoint.time) : 20,
  )
  const navigate = useNavigate()

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set meeting point" />

      <p style={{ color: 'var(--text-muted)', marginBottom: 18, fontSize: '1.05rem' }}>
        Use this for a regroup that isn't the bus: a fountain, a shop
        entrance, anywhere the group scatters from.
      </p>

      <div className="stack">
        <label className="eyebrow" htmlFor="label">
          Where
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Fountain by Bay 4"
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.15rem',
            padding: '0 16px',
            color: 'var(--text)',
          }}
        />

        <label className="eyebrow" htmlFor="minutes">
          Minutes from now
        </label>
        <input
          id="minutes"
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.5rem',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            color: 'var(--text)',
          }}
        />

        {error && (
          <p style={{ color: 'var(--warning)' }}>
            Can't get your location: {error}
          </p>
        )}

        <Button
          block
          disabled={!position || !label}
          onClick={() => {
            if (!position) return
            setMeetingPoint({
              label,
              lat: position.lat,
              lng: position.lng,
              time: new Date(Date.now() + minutes * 60_000).toISOString(),
            })
            navigate('/app/guide')
          }}
        >
          Set meeting point here
        </Button>

        {trip.meetingPoint && (
          <Button
            variant="ghost"
            block
            onClick={() => {
              setMeetingPoint(null)
              navigate('/app/guide')
            }}
          >
            Clear meeting point
          </Button>
        )}
      </div>
    </div>
  )
}
```

Only the `minutes` initial state changed (same `minutesRemaining` pattern as Task 1, applied to `trip.meetingPoint?.time`) — everything else in the file, including the existing `disabled={!position || !label}` validation (already correct, not part of the QA findings), is unchanged.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Verify with Playwright**

With the dev server running (start it if not already up from a prior task), navigate to Guide → Meeting pt. Set a meeting point with minutes `15` (requires geolocation — if the browser tool can't grant real geolocation permission automatically, use its geolocation-override/init-script mechanism to supply a fake position before the page loads, the same workaround the QA audit used). Navigate away then back into Meeting pt. Confirm the minutes field shows a number close to `15` (small elapsed-time drift is fine, `20` is not). Check `browser_console_messages` at `error` level. Kill the dev server when done if this was the last task run.

- [ ] **Step 4: Commit**

```bash
git add src/app/guide/SetMeetingPoint.tsx
git commit -m "fix: show remaining time on Set Meeting Point reopen"
```

---

### Task 3: Fix "Simulate check-ins" self-check-in bug

**Files:**
- Modify: `src/lib/TripProvider.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — `simulateCheckIns`'s exported signature (`() => void`) is unchanged, only its internal logic changes. Independent of the other 4 tasks.

- [ ] **Step 1: Fix `simulateCheckIns` in `src/lib/TripProvider.tsx`**

Find:

```tsx
  /** Demo helper: lets one browser show what a live roll-call looks like without other travelers' devices. */
  const simulateCheckIns = useCallback(
    () =>
      setTrip((t) => ({
        ...t,
        roster: t.roster.map((m, i) =>
          i < t.roster.length - 2 ? { ...m, checkedIn: true } : m,
        ),
      })),
    [],
  )
```

Replace with:

```tsx
  /** Demo helper: lets one browser show what a live roll-call looks like
   * without other travelers' devices. Deliberately excludes index 0 (the
   * current device's own identity — see RollCall.tsx's `trip.roster[0]`)
   * as well as the last 2 entries, so the presenter's own "I'm here"
   * button still requires a real tap and the demo still has a visible
   * "still missing" state to show off. */
  const simulateCheckIns = useCallback(
    () =>
      setTrip((t) => ({
        ...t,
        roster: t.roster.map((m, i) =>
          i > 0 && i < t.roster.length - 2 ? { ...m, checkedIn: true } : m,
        ),
      })),
    [],
  )
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Verify with Playwright**

With the dev server running, navigate to Guide → Roll call, start a fresh roll call, tap "Simulate check-ins (demo)" WITHOUT first checking in as the traveler. Switch to Traveler view → Roll call. Confirm the traveler's own screen still shows the "I'm here" button (not already showing "You're here") — this is the exact repro from the QA audit (`rollcall-simulate-selfcheckin-bug.png`), now expected to be fixed. Switch back to Guide view and confirm the tally still shows a sensible number checked in (roster length minus 3: index 0 and the last 2). Check `browser_console_messages` at `error` level. Kill the dev server when done if this was the last task run.

- [ ] **Step 4: Commit**

```bash
git add src/lib/TripProvider.tsx
git commit -m "fix: exclude the presenter's own device from the simulate-check-ins demo helper"
```

---

### Task 4: Add meeting-point status indicator to Guide Home

**Files:**
- Modify: `src/app/guide/GuideHome.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: `trip.meetingPoint` (already available via `useTrip()`, already destructured as `trip` in this file — no new import needed).
- Produces: nothing new — independent of the other 4 tasks.

- [ ] **Step 1: Add a 4th gauge tile in `src/app/guide/GuideHome.tsx`**

Find (the bus-pin tile, the last of the 3 tiles in `.gd-cluster`):

```tsx
        <div className="gd-gauge">
          <div
            className="gd-gauge__pin-icon"
            style={{ background: trip.busPin ? 'var(--success-bg)' : 'var(--warning-bg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={ICONS.pin}
                stroke={trip.busPin ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="gd-gauge__label">Bus pin</p>
          <p className="gd-gauge__value" style={{ fontSize: '1.05rem' }}>
            {trip.busPin ? 'Set' : 'Not set'}
          </p>
        </div>
      </div>
```

Replace with (adds a 4th tile using the same pattern, with the existing `flag` icon already defined in this file's `ICONS` map):

```tsx
        <div className="gd-gauge">
          <div
            className="gd-gauge__pin-icon"
            style={{ background: trip.busPin ? 'var(--success-bg)' : 'var(--warning-bg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={ICONS.pin}
                stroke={trip.busPin ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="gd-gauge__label">Bus pin</p>
          <p className="gd-gauge__value" style={{ fontSize: '1.05rem' }}>
            {trip.busPin ? 'Set' : 'Not set'}
          </p>
        </div>

        <div className="gd-gauge">
          <div
            className="gd-gauge__pin-icon"
            style={{ background: trip.meetingPoint ? 'var(--success-bg)' : 'var(--warning-bg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={ICONS.flag}
                stroke={trip.meetingPoint ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="gd-gauge__label">Meeting pt</p>
          <p className="gd-gauge__value" style={{ fontSize: '1.05rem' }}>
            {trip.meetingPoint ? 'Set' : 'Not set'}
          </p>
        </div>
      </div>
```

- [ ] **Step 2: Change `.gd-cluster` from a fixed 3-column layout to a 2x2 grid in `src/app/app.css`**

Find:

```css
.gd-cluster {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
```

Replace with:

```css
.gd-cluster {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
```

The 3-column `1fr 1.3fr 1fr` layout was sized for exactly 3 tiles with the departure tile widened as the visual "hero." With a 4th tile added, a 2-column grid (roll call + departure in row 1, bus pin + meeting point in row 2) is the layout that doesn't leave an orphaned single-item row or require restructuring the roll-call/departure/bus-pin tiles' own internal markup. The departure tile keeps its distinct visual weight from its own `.gd-gauge--hero` background/border/shadow styling (unchanged), just without the extra `1.3fr` width — this is an intentional, minimal layout adjustment, not an accidental side effect. The existing mobile override (`@media ... { .gd-cluster { grid-template-columns: 1fr; } }`, further down in this file) already collapses to a single column on narrow viewports regardless of the desktop column count, so it needs no change.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Verify with Playwright — desktop and mobile**

With the dev server running, navigate to Guide Home.

- At 1440×900: screenshot. Confirm 4 tiles render in a clean 2x2 grid (roll call + departure in the top row, bus pin + the new meeting-point tile in the bottom row), nothing overlaps or looks cramped. Confirm the meeting-point tile shows "Not set" with a warning-colored icon when no meeting point exists yet. Set a meeting point (Guide → Meeting pt), return to Guide Home, confirm the tile now shows "Set" with a success-colored icon.
- At 375×667: screenshot. Confirm all 4 tiles stack cleanly in a single column (existing mobile override), nothing overlaps.
- Check `browser_console_messages` at `error` level. Kill the dev server when done if this was the last task run.

- [ ] **Step 6: Commit**

```bash
git add src/app/guide/GuideHome.tsx src/app/app.css
git commit -m "feat: add meeting-point status indicator to Guide Home"
```

---

### Task 5: Manual per-traveler check-in on Guide Roll Call

**Files:**
- Modify: `src/app/guide/GuideRollCall.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: `checkIn` from `useTrip()` (already exists, already used by `RollCall.tsx` for the traveler's own self-check-in — same function, new caller).
- Produces: nothing new — independent of the other 4 tasks.

- [ ] **Step 1: Wire manual check-in in `src/app/guide/GuideRollCall.tsx`**

Find:

```tsx
export default function GuideRollCall() {
  const { trip, startRollCall, endRollCall, simulateCheckIns } = useTrip()
```

Replace with:

```tsx
export default function GuideRollCall() {
  const { trip, startRollCall, endRollCall, simulateCheckIns, checkIn } = useTrip()
```

Find:

```tsx
          <div className="card" style={{ marginBottom: 14 }}>
            {trip.roster.map((m) => (
              <div className="roster-row" data-checked={m.checkedIn} key={m.id}>
                <span>{m.name}</span>
                <span className="roster-row__dot" aria-hidden />
              </div>
            ))}
          </div>
```

Replace with:

```tsx
          <div className="card" style={{ marginBottom: 14 }}>
            {trip.roster.map((m) => (
              <button
                type="button"
                className="roster-row"
                data-checked={m.checkedIn}
                disabled={m.checkedIn}
                onClick={() => checkIn(m.id)}
                key={m.id}
              >
                <span>{m.name}</span>
                <span className="roster-row__dot" aria-hidden />
              </button>
            ))}
          </div>
```

`disabled={m.checkedIn}` means tapping an already-checked-in row does nothing (there's no "uncheck" capability in `checkIn`, and adding one wasn't requested) — this makes that explicit rather than relying on the click handler being harmlessly idempotent.

- [ ] **Step 2: Add button-reset styling to `.roster-row` in `src/app/app.css`**

`.roster-row` is currently only used as a plain `<div>` in this one file — converting it to a `<button>` needs explicit resets so it keeps looking exactly like it did before (native `<button>` elements have their own default background/border/font/alignment that would otherwise show through).

Find:

```css
.roster-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  font-size: 1.05rem;
  border-bottom: 1px solid var(--line);
}
```

Replace with:

```css
.roster-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 4px;
  font-size: 1.05rem;
  font-family: inherit;
  color: inherit;
  background: none;
  border: none;
  border-bottom: 1px solid var(--line);
  text-align: left;
  cursor: pointer;
}

.roster-row:disabled {
  cursor: default;
}

.roster-row:not(:disabled):hover {
  background: var(--bg-raised);
}
```

`border: none` followed by `border-bottom: 1px solid var(--line)` on the next line is intentional and correct — the shorthand `border: none` clears all four sides first, then the longhand `border-bottom` re-applies just the bottom divider, reproducing the original div's appearance exactly.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Verify with Playwright**

With the dev server running, navigate to Guide → Roll call, start a fresh roll call. Confirm each roster row now looks the same as before (no visible layout/style change) but is keyboard-focusable (tab to a row, confirm a focus outline appears) and clickable. Click an unchecked traveler's row — confirm their status dot turns the success color and the tally count increments by 1 (matching what already happens when a traveler self-checks-in). Click that same row again (now checked in) — confirm nothing happens (button is disabled, tally doesn't change, no error). Switch to Traveler view for that same person's identity if testable, or confirm via `localStorage`/state inspection that `roster[id].checkedIn` is `true`. Check `browser_console_messages` at `error` level. Kill the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/app/guide/GuideRollCall.tsx src/app/app.css
git commit -m "feat: let the guide manually check in one traveler"
```

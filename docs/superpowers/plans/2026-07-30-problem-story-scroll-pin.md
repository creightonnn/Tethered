# Story-Section Pinned Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `Problem.tsx`'s static one-shot fade-in with a pinned, scroll-scrubbed cross-fade through its 4 story beats, at desktop widths only — mobile and `prefers-reduced-motion: reduce` keep today's exact behavior unchanged.

**Architecture:** `Problem.tsx` gets its own scoped `useGSAP` hook (independent of `Landing.tsx`'s shared `.reveal` batch) that registers a `gsap.matchMedia()` branch for `(min-width: 901px) and no-reduced-motion`. In that branch only, a CSS class (`story--pinned`) switches the 4 `.story__beat` elements from a static vertical list to absolutely-stacked layers in one fixed-height box, and a `ScrollTrigger` timeline pins that box for `+=250%` of scroll while scrubbing each beat's opacity/scale and its mark's color, cross-fading between beats as you scroll. A 4-dot progress indicator tracks the active beat. Outside that branch (mobile, or reduced-motion at any width), nothing changes from today.

**Tech Stack:** GSAP + `ScrollTrigger` + `@gsap/react`'s `useGSAP` (all already installed and already used by `Landing.tsx` for the site's existing scroll-reveal system) — no new dependency.

## Global Constraints

- No new npm dependency — the reference component's `motion`/`motion-react` package is rejected in favor of GSAP `ScrollTrigger`, already installed and already driving every other scroll effect on this page. (Spec: Architecture, Non-goals)
- No content changes — the 4 beats' and quote's copy stays byte-identical to today. (Spec: Non-goals)
- Scope is `src/marketing/sections/Problem.tsx` and `src/marketing/marketing.css` only — no other marketing section (`Hero`, `Magic`, `Showcase`, `Audience`, `FinalCTA`) or `Landing.tsx`'s shared `.reveal` batch changes. (Spec: Non-goals, Goal 4)
- Mobile (viewport at or below the site's existing `900px` breakpoint, matching `@media (max-width: 900px)` already used elsewhere in `marketing.css`) and `prefers-reduced-motion: reduce` at any width must render and behave exactly as they do today: static vertical list, one-shot `.reveal` fade via `Landing.tsx`'s shared `ScrollTrigger.batch`. (Spec: Goal 3)
- This repo has no test runner — verification throughout is `npm run build` (type-check + Vite build), `npm run lint` (oxlint), and Playwright-driven visual checks against the dev server, matching how the prior hero work in this repo was verified.
- Exact pin scroll-distance, cross-fade overlap, stage height, and opacity/scale numbers below are starting values, not fixed requirements — the spec explicitly calls for a first working draft to be tuned visually rather than nailed down on paper. Adjust them during this plan's own verification step if the screenshots show clipping, dead space, or a pace that reads wrong; note any change made.

---

### Task 1: Pinned scroll-scrubbed cross-fade for the story beats

**Files:**
- Modify: `src/marketing/sections/Problem.tsx` (full rewrite)
- Modify: `src/marketing/marketing.css` (additions only, alongside the existing `.story`/`.story__beat`/`.story__mark`/`.story__text`/`.story__quote` rules around line 146-187)

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger` (from `gsap/ScrollTrigger`), `useGSAP` (from `@gsap/react`) — same imports `Landing.tsx` already uses.
- Produces: `Problem` component, default export shape unchanged (`export function Problem()`), still imported and rendered by `src/marketing/Landing.tsx:7,58` with no changes needed there.

Note on breakpoint: the spec's Architecture section describes the desktop condition as `min-width: 768px`. During planning, the existing `marketing.css:409-428` `@media (max-width: 900px)` block was found to already define this page's mobile/desktop line at `900px` (it restyles `.story__beat`'s own grid at that exact breakpoint). Using `768px` for the new JS condition would create a `768px`–`900px` band where the pin is active but the beat's internal grid is still in its mobile 1-column style. This plan uses `(min-width: 901px)` instead, aligning with the breakpoint the codebase already established, per the Global Constraints note above about tuning exact values during implementation.

- [ ] **Step 1: Replace `src/marketing/sections/Problem.tsx`**

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const stage = stageRef.current
      if (!stage) return

      const mm = gsap.matchMedia()

      mm.add(
        { desktop: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean
            reduce: boolean
          }
          if (!desktop || reduce) return

          const beats = gsap.utils.toArray<HTMLElement>('.story__beat', stage)
          const dots = gsap.utils.toArray<HTMLElement>('.story__progress-dot', stage)
          const marks = beats.map(
            (beat) => beat.querySelector<HTMLElement>('.story__mark')!,
          )

          stage.classList.add('story--pinned')

          gsap.set(beats, { opacity: 0.15, scale: 0.96 })
          gsap.set(beats[0], { opacity: 1, scale: 1 })
          gsap.set(dots, { backgroundColor: 'var(--line)' })
          gsap.set(dots[0], { backgroundColor: 'var(--accent)' })
          gsap.set(marks, { color: 'var(--text-muted)' })
          gsap.set(marks[0], { color: 'var(--accent)' })

          const OVERLAP = 0.3
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: '+=250%',
              pin: true,
              scrub: 1,
            },
          })

          beats.forEach((beat, i) => {
            if (i === 0) return
            const at = i - OVERLAP
            const dur = OVERLAP * 2
            tl.to(beats[i - 1], { opacity: 0.15, scale: 0.96, duration: dur }, at)
            tl.to(beat, { opacity: 1, scale: 1, duration: dur }, at)
            tl.to(marks[i - 1], { color: 'var(--text-muted)', duration: dur }, at)
            tl.to(marks[i], { color: 'var(--accent)', duration: dur }, at)
            tl.to(dots[i - 1], { backgroundColor: 'var(--line)', duration: dur }, at)
            tl.to(dots[i], { backgroundColor: 'var(--accent)', duration: dur }, at)
          })

          return () => {
            stage.classList.remove('story--pinned')
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section id="story" ref={sectionRef}>
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually happened</p>
        <h2>It worked, until the group split up.</h2>
      </div>

      <div className="story" ref={stageRef}>
        <div className="story__progress">
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Hokkaido, day 6</span>
          <p className="story__text">
            Eighteen travelers, two guides, eleven days, seven hotels.
            On-bus coordination was a whiteboard with the return time,
            plus a group chat. It worked, until the group split up.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Sapporo, free-wander</span>
          <p className="story__text">
            The moment anyone stepped off the bus and into a mall or a
            restaurant, their phone lost signal. Every tool built to help,
            the group chat, the live location sharing, went dark right
            when it was needed most.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Half the group, 30 minutes apart</span>
          <p className="story__text">
            Some travelers stayed near the hotel. Others walked half an
            hour to a shopping center. When someone got turned around
            inside the mall, there was no easy way to find the rest of
            the group.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Hokkaido → Tokyo → Honolulu</span>
          <p className="story__text">
            Three flights home, and the same questions on repeat: what
            terminal, which gate. One traveler took the escalator instead
            of the elevator and got separated from everyone else.
          </p>
        </div>
      </div>

      <p className="story__quote reveal">
        "I wish I could save a waypoint while I still had internet on the
        bus, so I'd know where I went and how to get back with no
        connection."
        <br />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          (a traveler on that trip)
        </span>
      </p>
    </section>
  )
}
```

Notes for the implementer:
- `beats`, `dots`, and `marks` are found via `gsap.utils.toArray` / `querySelector` scoped to `stage`, not via React refs — this matches the selector-string idiom `Landing.tsx` already uses inside its own `useGSAP`, rather than introducing a new ref-array pattern.
- The `.reveal` class stays on the 4 beats and the quote. It's still needed for the mobile/reduced-motion fallback (handled entirely by `Landing.tsx`'s existing shared batch, untouched by this task) and does not conflict with the new pin timeline: the shared batch's one-shot fade-in always completes (bringing beats to their default visible state) before the user can scroll far enough to reach the pin trigger point further down the page, and after that one-shot fires it never touches those elements again.
- `gsap.registerPlugin(ScrollTrigger)` is repeated here (it's already called once in `Landing.tsx`) because `gsap.registerPlugin` is idempotent and this keeps `Problem.tsx` correct on its own regardless of import order or whether it's ever rendered outside `Landing.tsx`.

- [ ] **Step 2: Add the pinned-mode CSS to `src/marketing/marketing.css`**

Add this block immediately after the existing `.story__quote { ... }` rule (around line 187) and before the `/* -- magic section -- */` comment:

```css
/* -- story: pinned scroll-scrubbed cross-fade (desktop, motion-safe only) -- */
.story--pinned {
  position: relative;
  height: 440px;
}

.story--pinned .story__beat,
.story--pinned .story__beat:last-child {
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  align-content: start;
}

.story__progress {
  display: none;
}

.story--pinned .story__progress {
  display: flex;
  position: absolute;
  left: -32px;
  top: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.story__progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--line);
}
```

This is additive only — every existing `.story`/`.story__beat`/`.story__mark`/`.story__text`/`.story__quote` rule stays as-is, so the mobile (`≤900px`) and reduced-motion fallback (where `story--pinned` is never added to the DOM) render exactly as they do today.

- [ ] **Step 3: Build to verify it type-checks**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings in unrelated files are fine, matching the bar used in prior work in this repo).

- [ ] **Step 5: Start the dev server and verify with Playwright — desktop**

Run: `npm run dev` (background it, note the port it prints).

Using the Playwright MCP tools, at 1440×900:
- Navigate to the dev server, scroll down until the `#story` section's `.story` block reaches the top of the viewport and pins (confirm the page stops scrolling the section itself while your scroll input continues — the URL/rest of the page should hold still while the pin is active).
- Take screenshots at a few points through the pinned scroll range (e.g. roughly 0%, 25%, 50%, 75%, 100% of the way through it) and confirm: exactly one beat is at full opacity/scale with its mark in accent color at each point, the sequence goes Hokkaido → Sapporo → Half the group → Hokkaido/Tokyo/Honolulu in order, the other three beats are visibly dimmed/receded (not fully hidden), and the 4-dot progress indicator's active dot advances in step.
- Confirm no beat's text is clipped by the `440px` stage height — if any beat's text overflows the box, increase the height in Step 2's CSS and re-screenshot. If there's a lot of dead space below every beat's text, reduce it. Note whatever final value you land on.
- Continue scrolling past the pinned range and confirm the pin releases smoothly, the page resumes normal scrolling, and the quote appears right after via its existing fade-in.
- Check `browser_console_messages` at `error` level — expected: none attributable to this change (pre-existing browser-extension noise is fine, matches what was seen in prior work in this repo).

- [ ] **Step 6: Verify with Playwright — mobile fallback**

At 375×667: navigate to the dev server, scroll through the `#story` section, and confirm it renders and behaves exactly as it did before this task — a static vertical list of the 4 beats (mark above text, per the existing `@media (max-width: 900px)` rule), each fading in once via the existing `.reveal` behavior, no pinning, no progress dots visible. Screenshot to confirm.

- [ ] **Step 7: Verify with Playwright — reduced motion**

At 1440×900 with `prefers-reduced-motion: reduce` emulated: navigate to the dev server, scroll through the `#story` section, and confirm it renders the same static-list fallback as the mobile case (no pinning, no progress dots, one-shot fade only). Screenshot to confirm.

- [ ] **Step 8: Commit**

```bash
git add src/marketing/sections/Problem.tsx src/marketing/marketing.css
git commit -m "feat: pin and scroll-scrub the story section's beats on desktop"
```

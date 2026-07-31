# Story-Beats Sticky-Image "Own Page" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the story section's single shared-pin-timeline cross-fade with 4 independent, self-contained "story beat" blocks — each with its own real photo that sticks and gently scales as its block scrolls past, giving each beat its own full-page-feeling moment, with no cross-beat timing coordination of any kind.

**Architecture:** A new `StoryBeat` component is rendered 4 times by `Problem.tsx`, each instance fully independent: its own `useGSAP` scope, its own `matchMedia` gate, its own `ScrollTrigger`. Each beat's photo uses CSS `position: sticky` (not GSAP `pin`) to stay in view while its ~160vh-tall column scrolls past, and GSAP scrubs a subtle continuous scale on that photo tied to the beat's own scroll range via ScrollTrigger's `top bottom`/`bottom top` keywords — no fixed pixel or `%`-based end values anywhere, so nothing here can fall out of sync with viewport height the way the previous design's fixed stage height did.

**Tech Stack:** GSAP + `ScrollTrigger` + `@gsap/react`'s `useGSAP` (already installed, already used throughout this page) — no new dependency.

## Global Constraints

- No shared cross-beat timeline or shared "stage" — every `StoryBeat` instance is fully independent, scoped to its own container ref. (Spec: Goal 1, Architecture)
- No new npm dependency. (Spec: Non-goals)
- No changes to the 4 beats' mark/text copy or the closing quote's copy — only new imagery and new scroll mechanics. (Spec: Non-goals)
- No changes to `Hero.tsx`, `Landing.tsx`, or any other marketing section. (Spec: Non-goals)
- No progress indicator of any kind — the previous design's 4-dot indicator is dropped with no replacement, confirmed with the user. (Spec: Goal 6)
- Images are newly sourced from Unsplash, not reused from the hero's marquee, and verified to return `HTTP 200` / `image/*` before use — this plan's images were already sourced and verified during planning (see Task 2). (Spec: Goal 2)
- Photo framing: `border-radius: 20px`, `border: 1px solid var(--line)`, a soft shadow — matching this page's existing `.magic-card`/`.audience-card` surface convention and the hero's own photo treatment, not a new visual language. (Spec: Goal 2, Architecture)
- All 4 beats render through the exact same `StoryBeat` component with the same internal timing/easing constants — consistency across beats is structural (one component, reused four times), not something to separately tune per instance. (Spec: Goal 5)
- Mobile (any width where the `matchMedia` desktop condition doesn't match, i.e. `<901px`) and `prefers-reduced-motion: reduce` (at any width) must render with no sticky positioning and no scroll-scrubbed scale — a plain single-column stack, image above text. This plan achieves it via one JS-driven CSS class (`story-beat--motion`) rather than a separate CSS media query, so both fallback cases are handled identically by construction. (Spec: Goal 7)
- No test runner in this repo — verification is `npm run build`, `npm run lint`, and Playwright, **at multiple desktop widths and heights**, not just one configuration — the previous plan's final review only caught its 3 real bugs because it happened to test outside the single 1440×900 setup used during task-level verification. (Spec: Testing/Verification)

---

### Task 1: `StoryBeat` component

**Files:**
- Create: `src/marketing/sections/StoryBeat.tsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger` (from `gsap/ScrollTrigger`), `useGSAP` (from `@gsap/react`) — same imports already used elsewhere on this page.
- Produces: `StoryBeat` component, exported from `src/marketing/sections/StoryBeat.tsx`, props `{ mark: string; text: string; imageUrl: string; imageAlt: string; align: 'left' | 'right' }` — Task 2 imports this as `./StoryBeat` and renders it 4 times.
- Produces the CSS class hooks Task 2's CSS work targets: `.story-beat`, `.story-beat--reverse`, `.story-beat--motion`, `.story-beat__image-col`, `.story-beat__image-frame`, `.story-beat__image`, `.story-beat__content` (this component also reuses the existing `.story__mark`/`.story__text` classes from `marketing.css`, unchanged).

- [ ] **Step 1: Create `src/marketing/sections/StoryBeat.tsx`**

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface StoryBeatProps {
  mark: string
  text: string
  imageUrl: string
  imageAlt: string
  align: 'left' | 'right'
}

export function StoryBeat({ mark, text, imageUrl, imageAlt, align }: StoryBeatProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const image = imageRef.current
      const content = contentRef.current
      if (!wrapper || !image || !content) return

      const mm = gsap.matchMedia()

      mm.add(
        { desktop: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean
            reduce: boolean
          }
          if (!desktop || reduce) return

          wrapper.classList.add('story-beat--motion')

          gsap.set(content, { opacity: 0, y: 24 })

          // One-shot entrance fade for the text, independent of the
          // image's continuous scrub below. Deliberately NOT using the
          // sitewide `.reveal` + Landing.tsx's shared ScrollTrigger.batch:
          // that batch never actually fires for motion-safe users (a
          // separate, pre-existing bug), so relying on it here would mean
          // this text never animates in for the audience this feature
          // targets.
          ScrollTrigger.create({
            trigger: content,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(content, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
            },
          })

          // Continuous scale tied to how far the wrapper has traveled
          // through the viewport. 'top bottom' -> 'bottom top' are
          // ScrollTrigger's built-in relative keywords (the wrapper's top
          // hitting the viewport's bottom, through the wrapper's bottom
          // hitting the viewport's top) — no fixed px or vh value is
          // needed here, so this can't fall out of sync with viewport
          // height the way the previous design's fixed stage height did.
          gsap.fromTo(
            image,
            { scale: 1 },
            {
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )

          return () => {
            wrapper.classList.remove('story-beat--motion')
          }
        },
      )

      return () => mm.revert()
    },
    { scope: wrapperRef },
  )

  return (
    <div
      className={`story-beat${align === 'right' ? ' story-beat--reverse' : ''}`}
      ref={wrapperRef}
    >
      <div className="story-beat__image-col">
        <div className="story-beat__image-frame" ref={imageRef}>
          <img src={imageUrl} alt={imageAlt} className="story-beat__image" />
        </div>
      </div>
      <div className="story-beat__content" ref={contentRef}>
        <span className="story__mark">{mark}</span>
        <p className="story__text">{text}</p>
      </div>
    </div>
  )
}
```

Notes for the implementer:
- The image's sticky positioning is pure CSS (`position: sticky`, added in Task 2's CSS work) — GSAP is only used here for the continuous scale scrub and the one-shot text fade, not for pinning. This is a deliberate departure from the previous design's GSAP `pin: true` approach: sticky composes trivially with the two-column grid layout with no spacer/layout-interaction risk, and needs no `navOffset` measurement (the sticky `top` offset is a plain CSS value set in Task 2).
- `align="right"` puts the image on the right / text on the left (via the `story-beat--reverse` class, wired up in Task 2's CSS using the same `order`-based technique as this page's existing `.showcase-row--reverse`). `align="left"` (or omitting the prop's right case) is the default: image left, text right.

- [ ] **Step 2: Build to verify it type-checks**

Run: `npm run build`
Expected: succeeds with no TypeScript errors. Nothing imports this component yet, but `tsconfig.app.json`'s `"include": ["src"]` covers every file in the tree, so `tsc -b` still type-checks it.

- [ ] **Step 3: Commit**

```bash
git add src/marketing/sections/StoryBeat.tsx
git commit -m "feat: add StoryBeat component for independent per-beat sticky-image sections"
```

---

### Task 2: Wire `StoryBeat` into `Problem.tsx`, add layout CSS, remove the old pinned-timeline CSS

**Files:**
- Modify: `src/marketing/sections/Problem.tsx` (full rewrite)
- Modify: `src/marketing/marketing.css` (remove the old pinned-timeline block, add the new per-beat layout block)

**Interfaces:**
- Consumes: `StoryBeat` from `./StoryBeat` (Task 1).
- Produces: `Problem` component, default export shape unchanged (`export function Problem()`), still imported and rendered by `src/marketing/Landing.tsx:7,58` with no changes needed there.

Four images were sourced and verified during planning (all returned `HTTP 200` / `image/jpeg` via `curl`, and cross-checked against `src/marketing/sections/Hero.tsx`'s existing 9 marquee images to confirm none are reused):

| Beat | Image | Source |
|---|---|---|
| Hokkaido, day 6 | `photo-1576829021150-ebc8b46b9fb9` | snow-covered mountain landscape, Japan |
| Sapporo, free-wander | `photo-1736519464863-cf84f243dd08` | snowy Hokkaido city street |
| Half the group, 30 minutes apart | `photo-1761442664224-bcc947600fe1` | people walking through an outdoor shopping center |
| Hokkaido → Tokyo → Honolulu | `photo-1642035148715-7cc0c7538904` | airport terminal departure-times sign |

- [ ] **Step 1: Replace `src/marketing/sections/Problem.tsx`**

```tsx
import { StoryBeat } from './StoryBeat'

export function Problem() {
  return (
    <section id="story">
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually happened</p>
        <h2>It worked, until the group split up.</h2>
      </div>

      <StoryBeat
        mark="Hokkaido, day 6"
        text="Eighteen travelers, two guides, eleven days, seven hotels. On-bus coordination was a whiteboard with the return time, plus a group chat. It worked, until the group split up."
        imageUrl="https://images.unsplash.com/photo-1576829021150-ebc8b46b9fb9?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Snow-covered mountain landscape in Hokkaido, Japan"
        align="left"
      />

      <StoryBeat
        mark="Sapporo, free-wander"
        text="The moment anyone stepped off the bus and into a mall or a restaurant, their phone lost signal. Every tool built to help, the group chat, the live location sharing, went dark right when it was needed most."
        imageUrl="https://images.unsplash.com/photo-1736519464863-cf84f243dd08?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Snowy city street in Hokkaido, Japan"
        align="right"
      />

      <StoryBeat
        mark="Half the group, 30 minutes apart"
        text="Some travelers stayed near the hotel. Others walked half an hour to a shopping center. When someone got turned around inside the mall, there was no easy way to find the rest of the group."
        imageUrl="https://images.unsplash.com/photo-1761442664224-bcc947600fe1?w=1200&auto=format&fit=crop&q=60"
        imageAlt="People walking through an outdoor shopping center"
        align="left"
      />

      <StoryBeat
        mark="Hokkaido → Tokyo → Honolulu"
        text="Three flights home, and the same questions on repeat: what terminal, which gate. One traveler took the escalator instead of the elevator and got separated from everyone else."
        imageUrl="https://images.unsplash.com/photo-1642035148715-7cc0c7538904?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Airport terminal with a departure times sign"
        align="right"
      />

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

- [ ] **Step 2: Replace the old pinned-timeline CSS block in `src/marketing/marketing.css`**

Replace this entire range — from the `/* -- problem / story -- */` comment (currently line 146) through the `.story__progress-dot { ... }` rule (currently ending around line 241), immediately before the `/* -- magic section -- */` comment:

```css
/* -- problem / story -- */
.story {
  display: grid;
  gap: 20px;
}

.story__beat {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 22px;
  padding: 26px 0;
  border-top: 1px solid var(--line);
}

.story__beat:last-child {
  border-bottom: 1px solid var(--line);
}

.story__mark {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--accent);
  padding-top: 4px;
}

.story__text {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--paper-100);
  max-width: 58ch;
}

.story__quote {
  margin-top: 28px;
  font-size: 1.3rem;
  line-height: 1.5;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  color: var(--text);
  max-width: 52ch;
}

/* -- story: pinned scroll-scrubbed cross-fade (desktop, motion-safe only) -- */
.story--pinned {
  position: relative;
  /* Fixed pixel height under-reserved pin/scrub slack as viewport height
     grew (the quote below would start entering view before beat 4's
     crossfade finished, see marketing.css history). Scaling with 100vh
     (floored at the original 480px, capped at 900px so very tall
     viewports don't stretch the stage absurdly) keeps proportionally more
     headroom as the viewport gets taller. */
  height: clamp(480px, calc(100vh - 180px), 900px);
  /* Reserve a left gutter, inside the content box, for the progress-dot
     rail below — see .story--pinned .story__progress. */
  padding-left: 32px;
}

.story--pinned .story__beat,
.story--pinned .story__beat:last-child {
  position: absolute;
  /* Not `inset: 0`: absolutely positioned children are offset from the
     *padding* edge of their containing block, so `.story--pinned`'s own
     padding-left has no effect on them. The left offset has to be set
     explicitly here to actually reserve room for the dot rail (which
     sits at left: 0) instead of overlapping the beat's mark column. */
  top: 0;
  right: 0;
  bottom: 0;
  left: 32px;
  border: none;
  padding: 0;
  align-content: center;
}

.story__progress {
  display: none;
}

.story--pinned .story__progress {
  display: flex;
  position: absolute;
  left: 0;
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

with:

```css
/* -- problem / story -- */
.story__mark {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--accent);
  padding-top: 4px;
}

.story__text {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--paper-100);
  max-width: 58ch;
}

.story__quote {
  margin-top: 28px;
  font-size: 1.3rem;
  line-height: 1.5;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  color: var(--text);
  max-width: 52ch;
}

/* -- story: independent per-beat sticky-image sections --
   Each StoryBeat instance is fully self-contained: `story-beat--motion`
   (added by StoryBeat.tsx only on desktop + motion-safe) is the single
   switch that turns on the two-column layout, the tall sticky-dwell
   column, and the image's sticky positioning. When that class is absent
   (mobile, at any width — the class is simply never added there — or
   desktop with prefers-reduced-motion: reduce), every beat renders as a
   plain single-column stack with no extra height and no sticky
   positioning, with no separate media query needed to achieve that. */
.story-beat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 32px 0;
}

.story-beat--motion {
  grid-template-columns: 0.95fr 1.05fr;
  gap: 48px;
  padding: 48px 0;
}

.story-beat--motion.story-beat--reverse {
  grid-template-columns: 1.05fr 0.95fr;
}

.story-beat--motion.story-beat--reverse .story-beat__image-col {
  order: 2;
}

.story-beat--motion .story-beat__image-col {
  /* Explicit height on the column itself (not relying on grid's implicit
     row-stretch behavior) is what gives the sticky image room to dwell:
     position: sticky needs its containing block to be taller than the
     sticky element for the "stuck" effect to last more than an instant. */
  min-height: 160vh;
}

.story-beat__image-frame {
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--line);
  box-shadow: 0 20px 40px -24px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.story-beat--motion .story-beat__image-frame {
  position: sticky;
  top: 96px;
}

.story-beat__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.story-beat--motion .story-beat__content {
  align-self: center;
}

.story-beat__content .story__mark {
  display: block;
  margin-bottom: 14px;
}

.story-beat__content .story__text {
  max-width: 46ch;
}
```

- [ ] **Step 3: Remove the now-dead mobile `.story__beat` override**

In the `@media (max-width: 900px)` block (currently around line 475-478), delete this rule — `.story__beat` no longer exists as a class anywhere in the new markup, so this rule is dead:

```css
  .story__beat {
    grid-template-columns: 1fr;
    gap: 8px;
  }
```

Leave the surrounding rules in that media query block (`.magic-grid`/`.audience-grid`, `.showcase-row`/`.showcase-row--reverse`, `.mkt section`) untouched.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds with no errors. This also confirms nothing else in the codebase still references `.story__beat`, `.story--pinned`, `.story__progress`, or `.story__progress-dot` as a class name (a TypeScript/JSX build won't catch dead CSS selectors directly, but a successful build at least confirms no `.tsx` file still imports or references the old `StoryBeat`-shaped markup incorrectly).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings in unrelated files are fine, matching the bar used throughout this project).

- [ ] **Step 6: Start the dev server and verify with Playwright — desktop, multiple widths and heights**

Run: `npm run dev` (background it, note the port it prints).

Using the Playwright MCP tools (or an equivalent browser-automation tool if Playwright's MCP connection is unavailable — note explicitly in your report which tool you used and if any check could only be done via code-reasoning instead of live verification):

- At **1440×900**: scroll through the full `#story` section. Confirm each beat's photo sticks in place (visibly stops scrolling with the page) while its column scrolls past, with a subtle continuous scale-up as you scroll through it; confirm the mark/text content fades in once as each beat's column enters view; confirm beats alternate image-left/image-right correctly (Hokkaido=left, Sapporo=right, Half the group=left, flights=right); confirm one beat's sticky dwell ends and the next beat's photo is already in place for a clean handoff, with no dead gap or overlap; confirm the quote appears normally after the last beat.
- Repeat the same scroll-through at **1024×900** and **1280×900** — confirm the two-column layout doesn't look cramped or broken at the narrower width, and that sticky/scrub behavior is consistent across all three widths.
- Repeat once more at **1440×1300** (a taller viewport) — confirm the sticky dwell and scale-scrub still read correctly (this is the multi-height check the previous plan's task-level verification skipped, which is exactly what let 2 of the final review's 3 bugs slip through).
- **No clipping:** confirm no beat's image or text is cut off at any of the four width/height combinations above.
- **Console:** check `browser_console_messages` at `error` level at each of the four configurations — expected: none attributable to this change (pre-existing browser-extension noise is fine, matching the bar used throughout this project).

- [ ] **Step 7: Verify with Playwright — mobile fallback**

At **375×667**: scroll through `#story`. Confirm every beat renders as a plain single-column stack (image above text, framed with the same rounded-corner/border/shadow treatment), no sticky positioning (photos scroll normally with the page, don't hang in place), no scale animation. Screenshot to confirm.

- [ ] **Step 8: Verify with Playwright — reduced motion**

At **1440×900** with `prefers-reduced-motion: reduce` emulated: scroll through `#story`. Confirm the same fallback as mobile — single-column stack, no sticky, no scale-scrub — even though the viewport is desktop-width. Screenshot to confirm.

- [ ] **Step 9: Commit**

```bash
git add src/marketing/sections/Problem.tsx src/marketing/marketing.css
git commit -m "feat: replace story section's shared pin timeline with independent per-beat sticky-image sections"
```

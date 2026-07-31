# Story-beats sticky-image "own page" redesign — design

## Context

The pinned single-timeline cross-fade shipped earlier today (`2026-07-30-problem-story-scroll-pin-design.md`) replaced the story section's static list with 4 beats cross-fading inside one shared pinned "stage." It works and is bug-free as shipped, but user feedback after seeing it live: the beats have no complementary imagery, and the scroll "feels like it has no movement" — each beat should feel like it has its own page.

This is a real architectural change, not a tuning pass on the same design. Research on 21st.dev's component catalog (`get_inspiration`/`search_picker` for "scroll-driven storytelling, pinned narrative beats") surfaced a much better-fitting pattern than what's live: **"Text Parallax Content (scroll)"** — a sticky image that scales/fades while text overlays cross-fade over it, explicitly designed to be "stacked... to create a series of distinct narrative sections, each with its own image and text." That's the shape being adopted here (concept only — the reference is built on Framer Motion's `useScroll`/`useTransform`; this repo standardizes on GSAP `ScrollTrigger`, already used everywhere else on this page, so the same idea is implemented with GSAP, no new dependency).

The single-timeline architecture being replaced required one shared "stage" to correctly coordinate 4 beats' timing against a fixed pixel height, a pin distance, and the actual viewport height — the final whole-branch review on that plan caught 3 real bugs from exactly that coordination (progress dots off-screen below ~1210px width, a bleed-through fix that inverted above ~1030px viewport height, z-index overlap), all fixed but all *emergent from* the shared-timeline design. This redesign deliberately avoids that failure class: each beat becomes a fully independent block with its own `ScrollTrigger`, sized in viewport-relative units so its pin distance is always proportional to the viewport, not dependent on any fixed pixel value.

## Goals

1. Replace the single shared-pin-timeline architecture with 4 independent, self-contained beats — each a normal-flow block roughly 150-180vh tall, no shared "stage," no cross-beat timing coordination of any kind.
2. Each beat gets a real photo, newly sourced from Unsplash and matched to its specific content (not reused from the hero's image set, per user's explicit choice), styled as a framed photograph — `border-radius: 20px`, `border: 1px solid var(--line)`, soft shadow — consistent with this page's existing `.magic-card`/`.audience-card` surface convention and the hero's own photo treatment.
3. While a beat is in its scroll "dwell" (pinned in the viewport), its photo continuously scrubs a subtle scale (approximately `1.0` → `1.08`) tied directly to scroll progress, so scrolling always visibly moves something for as long as that beat is on screen — not just at the entrance/exit edges.
4. Beats alternate image-left/image-right, reusing the existing `.showcase-row`/`.showcase-row--reverse` two-column layout pattern already established in `marketing.css` for the Showcase section.
5. All 4 beats are literally the same component (`StoryBeat`) with the same props shape and the same internal timing constants — consistency across beats is structural (one implementation, reused four times), not something separately maintained per instance.
6. The 4-dot progress indicator from the previous design is dropped entirely, with no replacement — confirmed with the user. Each beat's mark label now serves as its own chapter heading, occupying a full viewport moment on its own.
7. Mobile (`≤900px`) and `prefers-reduced-motion: reduce` render with no pinning and no scroll-scrubbed scale: a plain single-column stack (image above text), matching the same fallback principle as the previous design and consistent with how `.showcase-row`/`.showcase-row--reverse` already collapse to `1fr` at `900px` today.

## Non-goals

- No shared cross-beat timeline or shared "stage" box — that's specifically the architecture being replaced.
- No new dependency. Still GSAP `ScrollTrigger` + `@gsap/react`'s `useGSAP`; the reference component's Framer Motion (`motion/react`) pattern is adapted conceptually only, same reasoning as the previous story-section work and the hero.
- No content changes to the 4 beats' mark/text or the closing quote — only new imagery and the new scroll mechanics.
- No changes to `Hero.tsx`, `Landing.tsx`, or any other marketing section.
- No progress indicator of any kind replacing the dropped dots.
- No attempt to fix the pre-existing, unrelated bug (found during the last plan's final review) where `Landing.tsx`'s shared `.reveal`/`ScrollTrigger.batch` never actually fires for motion-safe users — out of scope, `Landing.tsx` is not touched. The fallback path below relies on the same `.reveal` class purely for visual/marker consistency with the rest of the page, not because it's expected to animate anything (it currently doesn't, sitewide, for anyone without reduced motion set — this redesign doesn't change that pre-existing behavior one way or the other).

## Architecture

**New component:** `src/marketing/sections/StoryBeat.tsx` — a single component rendered 4 times by `Problem.tsx`, one per beat. Props: `{ mark: string; text: string; imageUrl: string; imageAlt: string; align: 'left' | 'right' }`. `Problem.tsx` becomes: unchanged header, 4 `<StoryBeat>` calls with each beat's content, unchanged closing quote.

**Why independent per-beat `ScrollTrigger`s avoid the previous bug class:** each `StoryBeat` sizes its own wrapper in `vh` units (e.g. `height: 160vh`) and pins its image with `end: 'bottom bottom'` (release when the wrapper's bottom reaches the viewport's bottom) rather than a hand-computed `+=Npx`/`+=N%` value. Because both the wrapper's height and the viewport height are expressed in the same viewport-relative terms, the pin's dwell distance (`wrapperHeight − viewportHeight`) is automatically proportional at every screen size — there is no fixed pixel "stage height" that can fall out of sync with a taller or shorter viewport the way the previous design's `480px`/`clamp(...)` stage height could. This isn't a tunable to verify later; it's a structural property of sizing everything in `vh`.

**Per-beat interaction (desktop, motion-safe only — same `matchMedia` gate as before):**
- The photo is pinned (`pin: true`) inside the beat's tall wrapper and scrubs `scale` from `1.0` to `1.08` across the pin's full dwell (`scrub: true`), tied directly to scroll position.
- The mark + text column plays one simple, non-scrubbed entrance animation (fade + slight rise) when the block's top crosses a threshold near the bottom of the viewport, using a separate small `ScrollTrigger` with `toggleActions: 'play none none none'` (fires once, does not reverse or repeat) — not the image's scrub timeline, and not the sitewide `.reveal` batch (see Non-goals: that batch doesn't currently fire for motion-safe users, so relying on it here would mean the text never animates in for the one audience this feature specifically targets).
- No de-sync risk between beats: because each `StoryBeat` instance's `ScrollTrigger`s are scoped to its own wrapper ref via its own `useGSAP({ scope })`, one beat's timing can never reference or depend on another's.

**Fallback (mobile, or `prefers-reduced-motion: reduce`, at any width):** the `matchMedia` early-return (same `{ desktop: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' }` shape as the previous design) skips all `ScrollTrigger` setup entirely. The wrapper collapses to its content's natural height (no fixed `vh` sizing needed once nothing is pinned — that sizing is a pinned-mode-only concern), image stacks above text in a single column, `.reveal` class stays on the elements for consistency with the rest of the page's markup conventions (acknowledged in Non-goals: this doesn't currently animate anything sitewide for motion-safe users, and this redesign doesn't change that either way).

**Visual treatment:** photo wrapped in a `<div>` styled `border-radius: 20px; border: 1px solid var(--line);` plus a soft shadow (concrete shadow value to be chosen during implementation to match — not exceed — the existing `.magic-card`/`.audience-card`/hero-marquee visual weight). Two-column layout at desktop matches `.showcase-row`'s existing grid proportions; `align="right"` beats use the `.showcase-row--reverse` column-order pattern already defined in `marketing.css`.

**Images:** 4 new Unsplash photo URLs, one per beat, chosen to match each beat's specific content (a Sapporo street/mall scene for "Sapporo, free-wander," an airport/gate scene for "Hokkaido → Tokyo → Honolulu," etc.) — each verified to return `HTTP 200` with an `image/*` content-type during implementation before use, not guessed from memory, matching how the hero's images were sourced.

## Data flow

None. Purely presentational — no props beyond the 4 static per-beat values listed above, no state beyond scroll position (owned by each beat's own `ScrollTrigger` instances), no data fetching.

## Testing / Verification

One bounded round, with an explicit multi-viewport requirement this time (the previous plan's final review only caught its 3 real bugs because it happened to test outside the single 1440×900 configuration the task-level verification used):

- `npm run build` + `npm run lint` — must both pass clean (no test runner in this repo).
- Verify all 4 new image URLs return `HTTP 200` / `image/*` before wiring them in.
- Playwright, desktop, **at least three widths** (e.g. 1024, 1280, 1440) **and at least two heights** (e.g. 900, 1300) at one of those widths: confirm each beat's photo pins and scrubs its scale smoothly through its own dwell, text fades in once per beat, beats alternate left/right correctly, and one beat's pin cleanly releases into the next with no overlap or dead gap.
- Playwright, mobile (375×667): confirm single-column stacked layout (image above text), no pinning, no scale-scrub.
- Playwright with `prefers-reduced-motion: reduce` emulated at desktop width: confirm the same fallback as mobile.
- Browser console clean of errors at all tested configurations (pre-existing extension noise excepted, matching the bar used throughout this project).
- Confirm the total page scroll length increase (4 beats × ~150-180vh) reads as intentional rather than excessive during the desktop screenshots — exact per-beat height is a starting target to tune visually, not a fixed requirement, same principle as the previous design's stated approach to its own tunables.

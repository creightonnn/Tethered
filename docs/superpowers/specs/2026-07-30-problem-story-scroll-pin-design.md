# Story-section pinned scroll — design

## Context

The user brought a reference component (`hero-scroll-animation.tsx`, a "ui-layout"-style demo) that pins two full-viewport sections and scrubs their scale/rotate as you scroll past. Evaluated as a hero replacement first and rejected for that spot: it delays the CTA behind ~200vh of scroll, ships generic placeholder content and unbranded styling, and would have undone the marquee hero built and shipped in the previous session (see `2026-07-30-tailwind-shadcn-marquee-hero-design.md`).

The user's actual intent, once clarified: apply the *concept* (scroll-driven, pinned, scrubbed reveal) — not the reference's literal code or layout — to `src/marketing/sections/Problem.tsx`, the marketing page's narrative section (`id="story"`). That section already reads as sequential storytelling: an eyebrow/h2 intro, four story beats (`Hokkaido, day 6` → `Sapporo, free-wander` → `Half the group, 30 minutes apart` → `Hokkaido → Tokyo → Honolulu`), and a closing pull-quote. Today it's a static vertical list that fades in once via the site's existing GSAP `ScrollTrigger.batch('.reveal', ...)` mechanism (wired in `Landing.tsx`), shared by every other section on the page.

This site already runs GSAP + `@gsap/react` + `ScrollTrigger` for all of its scroll-linked behavior. The reference component's Framer Motion (`motion/react`) `useScroll`/`useTransform` pattern was evaluated and rejected in favor of GSAP ScrollTrigger, to avoid running two independent scroll-linked animation engines on the same page — `pin` + `scrub` is exactly what ScrollTrigger is for, and it's already registered.

## Goals

1. Replace `Problem.tsx`'s static one-shot fade-in with a pinned, scroll-scrubbed cross-fade through its 4 story beats, at desktop widths (`≥768px`) with no reduced-motion preference.
2. Keep the section's current editorial tone (mono-font "mark" labels, restrained typography, accent-color highlight) — the effect should read as "the story unfolds as you scroll," not as a dramatic full-bleed panel swap.
3. Preserve the exact current behavior (static list, one-shot `.reveal` fade) for mobile and for `prefers-reduced-motion: reduce`, at any width — zero regression risk for those users.
4. Keep the section self-contained: `Problem.tsx` owns its own scroll behavior via its own `useGSAP` hook; `Landing.tsx`'s shared `.reveal` batch stays untouched, and no other section's behavior changes.

## Non-goals

- No changes to any other marketing section (Hero, Magic, Showcase, Audience, FinalCTA) — scope is `Problem.tsx` only, confirmed with the user.
- No new npm dependency. The reference component's `motion`/`motion-react` package is not installed — GSAP/ScrollTrigger/`@gsap/react` are already dependencies and are sufficient.
- No content changes — the 4 beats' and quote's copy stays exactly as it is today.
- No identical pin+scrub behavior on mobile — mobile intentionally keeps the simpler existing behavior (see Goal 3), not attempting to replicate the desktop effect at narrow viewports.
- Exact pin scroll-distance, cross-fade overlap window, and opacity/scale numbers are not fixed by this spec — see Testing/Verification. The user has explicitly asked to see a first working draft and revise from there rather than nail exact values on paper.

## Architecture

**Component:** `src/marketing/sections/Problem.tsx` gains a container `ref` and a `ref` array over its 4 `.story__beat` elements, plus its own `useGSAP(() => {...}, { scope: containerRef })` hook (mirroring the pattern already used in `Landing.tsx`, but scoped locally to this section instead of living in the shared block).

**Responsive/motion branching:** inside that hook, `gsap.matchMedia()` registers named conditions, mirroring the exact pattern `Landing.tsx` already uses for its own reduced-motion check:
```js
mm.add(
  { desktop: '(min-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' },
  (context) => {
    const { desktop, reduce } = context.conditions as { desktop: boolean; reduce: boolean }
    if (!desktop || reduce) return // fall through to the unchanged default below
    // ...build the pin+scrub timeline (below)...
  },
)
```
When the callback returns early (`!desktop || reduce`), nothing further happens: the beats keep their current static-list CSS and animate via the page's existing shared `ScrollTrigger.batch('.reveal', ...)` in `Landing.tsx`, completely unchanged. That's not a new code path to build — it's the current code left alone.

A class toggle on the container (added only inside the `desktop` branch, e.g. `.story--pinned`) switches the 4 beats' CSS from normal document flow to absolutely-stacked-in-place — this is a pure CSS change gated by the same `matchMedia` condition, not a JS layout swap of the beats themselves. The beats' JSX and content are identical in both branches.

**Pin + scrub timeline (desktop branch):**
- `ScrollTrigger` pins the `.story` container for a scroll distance long enough to comfortably scrub through 4 beats with a bit of cross-fade overlap between adjacent ones (design target: ~250vh; exact value tuned during implementation, see Testing/Verification).
- A `scrub: true` GSAP timeline drives each beat's `opacity`/`scale` (and the corresponding `.story__mark`'s color) across the pin's scroll range, split into 4 segments (one per beat) with a small overlap at each boundary so beats cross-fade rather than hard-cut. The active beat's segment: opacity → 1, scale → 1, mark color → `var(--accent)`. Inactive beats: opacity → ~0.15, scale → ~0.96, mark color → its current dimmed default.
- A small 4-dot progress indicator (new, minimal markup — a `<div>` of 4 dots beside the stage) is driven by the same timeline/progress value, highlighting whichever dot corresponds to the active beat.
- On the timeline's completion, the pin releases and the quote (`.story__quote`) proceeds exactly as today — normal document flow, animated by the shared `.reveal` batch, unchanged.

**Sizing:** the stage container needs a fixed height (CSS, sized to comfortably fit the longest of the 4 beats' text at the section's max content width) so that absolutely-stacked beats of varying text length don't clip or jump between each other. Exact value determined during implementation by measuring actual rendered content, not guessed here.

**CSS:** new rules added to `src/marketing/marketing.css` alongside the existing `.story`/`.story__beat`/`.story__mark`/`.story__text`/`.story__quote` rules (not a new stylesheet) — consistent with how every other section's CSS lives in that one file.

## Data flow

None. Purely presentational/animation — no new props, no state beyond scroll position (owned entirely by ScrollTrigger internally), no data fetching. The 4 beats and quote remain the same hardcoded JSX content as today.

## Testing / Verification

One bounded round, same pattern as the marquee-hero work:
- `npm run build` + `npm run lint` — must both pass clean (this repo has no test runner).
- Playwright, desktop (1440×900): screenshot at several scroll depths through the pinned range, confirming each of the 4 beats becomes the active (full-opacity, accent-marked) one in sequence, the progress dots track correctly, and the pin visibly releases into the quote afterward with no layout jump.
- Playwright, mobile (375×667): confirm the section still renders as today's static list with the existing one-shot fade — no pinning, no absolute-stacking, no regression.
- Playwright with `prefers-reduced-motion: reduce` emulated at desktop width: confirm the fallback (static list, one-shot fade) triggers there too, not the pinned timeline.
- Browser console clean of errors at both viewports (same bar as prior work — pre-existing extension noise is expected and fine).
- The exact pin distance, cross-fade overlap, and opacity/scale numbers in the Architecture section above are starting targets, not fixed requirements — the user has explicitly asked to see a first working draft and iterate visually from there rather than pre-specify exact values. The implementation plan should treat these as tunable during its own build-and-verify step, adjusted until the desktop screenshots read correctly, rather than treating the spec's numbers as gospel.

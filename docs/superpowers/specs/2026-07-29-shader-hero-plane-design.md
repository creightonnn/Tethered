# Shader-sky hero with a 3D flying plane — design

## Context

The marketing hero (`src/marketing/sections/Hero.tsx`) currently proves the product's "find the bus" mechanism directly: golden-hour ridge-silhouette SVG background, a full-scale compass dial with a GSAP-animated needle settling toward the bus, and a JetBrains Mono bearing/distance readout, per the thesis documented in the file's own header comment and in `DESIGN.md`.

The user brought a reference (a generic shadcn/Tailwind "animated-shader-hero" component: a WebGL2 fragment shader producing glowing light-streaks over drifting cloud/smoke, rendered in a warm orange/amber tone behind a big gradient-text headline) and, after several rounds of narrowing scope, decided to adopt the **visual technique** (the WebGL streak/cloud shader as a background) while keeping Tethered's own typography, button system, and copy — plus add a real-time 3D Boeing 737 (Three.js) whose flight path echoes the shader's own light-streaks, and relocate the existing compass motif out of the hero and into the Showcase section's "Find the bus" phone mockup, where it already has real product context.

This project has no Tailwind, no shadcn, and no `components/ui` directory — the reference component's literal code (Tailwind utility classes, `style jsx`, `@/components/ui/...` import alias) does not run here as-is and was not used verbatim. Everything below is adapted to the existing `src/marketing/marketing.css` token-based system and `DESIGN.md`'s Expedition Field Guide contract.

Two prior attempts to hand this off as a fully self-contained prompt (once to this agent, once intended for Gemini as a standalone HTML file) were abandoned — both assumed a project structure or brand palette that doesn't match this repo. This spec supersedes them.

## Goals

1. Replace the hero's ridge/glow SVG background with a WebGL2 fragment shader (streak/cloud effect, adapted from the user's reference) retinted to Tethered's pine-green palette instead of the reference's orange.
2. Add a real-time 3D Boeing 737 (Three.js), rendered transparently over the shader, flying a slow swirling/converging path that echoes the shader's own light-streaks rather than a simple side-to-side arc.
3. Relocate the compass (dial, needle animation, bearing/distance readout) from the hero into `Showcase.tsx`'s existing "Find the bus" phone mockup, where the needle-settle animation triggers on scroll-into-view instead of on mount.
4. Keep the hero's headline, subtitle, CTAs, eyebrow copy, and button styling (Domine serif, `.mkt-btn--primary`/`.mkt-btn--outline`) exactly as they are today — this is a background/motion swap, not a content or type-system redesign.

## Non-goals

- No Tailwind, no shadcn, no `components/ui` directory, no gradient-text headlines, no gradient-pill buttons — the reference's literal styling is not adopted, only its shader technique.
- No change to hero copy, CTAs, or the rest of the marketing page (Problem/Magic/Audience/FinalCTA sections untouched).
- No literal shared math between the GLSL shader (2D screen-space) and the Three.js scene (3D world-space + perspective camera) — these are two separate rendering contexts that cannot practically share exact coordinates. The plane's path is tuned to *visually rhyme* with the shader's streaks (converging toward the same cluster point, similar slow phase drift), not mathematically derived from the shader's formula.
- No `.glb` model — the 737 is built from primitives (boxes/cylinders/capsule), consistent with there being no asset pipeline for 3D models in this project today. A commented-out block will show how to swap in a real `.glb` later via `GLTFLoader`, per the original ask.

## Architecture

**Files:**
- `src/marketing/ShaderSky.tsx` — new. WebGL2 canvas + render loop, replaces `.mkt-hero__ridges`/`.mkt-hero__glow` as the z-0 background layer.
- `src/marketing/FlyingPlane.tsx` — new. Transparent Three.js overlay (z-5, `pointer-events: none`), renders only the 737 and its flight path.
- `src/marketing/sections/Hero.tsx` — modified. Remove the ridge SVG and the `.mkt-hero__compass` block entirely (including the `needleRef`/`useGSAP` needle animation, which moves to Showcase). Render `<ShaderSky />` then `<FlyingPlane />` then the existing `.mkt-hero__scrim` + `.mkt-hero__content` unchanged.
- `src/marketing/sections/Showcase.tsx` — modified. Add the compass dial + needle + bearing readout markup (ported from today's `Hero.tsx`) into the existing "Find the bus" phone mockup card. The needle-settle `useGSAP` animation moves here, gated on the same `ScrollTrigger.batch('.reveal', ...)` mechanism Showcase's other reveals already use, rather than firing on mount.
- `src/marketing/marketing.css` — the compass-related classes (`.mkt-hero__compass*`) get renamed/relocated to Showcase-scoped classes (or reused as-is if the DOM structure is preserved); new classes added for `ShaderSky`'s canvas layer and `FlyingPlane`'s overlay container.
- `package.json` — add `three` (dependency) and `@types/three` (devDependency).

**ShaderSky (WebGL2):**
- Fragment shader adapted from the reference: same `clouds()`/`fbm()`/`noise()` domain-warp structure, streak loop reduced from 12 → 11 iterations (leaves room for the plane to read as occupying the missing streak's position), cloud base color mixed toward `vec3(bg*.10, bg*.20, bg*.155)` (pine-green, tuned and confirmed by rendered preview during design) instead of the reference's orange/brown mix. Streak highlight color stays near-neutral (white-hot core, cool falloff) — amber is deliberately not pushed into the shader itself, since `DESIGN.md` treats amber as a scarce "signal flare" reserved for the UI layer (headline emphasis, CTAs), not a background wash.
- Standard fullscreen-triangle-strip setup: vertex shader + fragment shader, `resolution`/`time` uniforms, `requestAnimationFrame` loop, DPR capped at 1.5x, `resize` listener updating canvas size + viewport.
- `prefers-reduced-motion`: freeze the `time` uniform and stop the RAF loop after one render (static cloud frame, no motion) rather than removing the canvas.
- Pause the RAF loop on `visibilitychange` when the tab is hidden; resume on visible.
- Cleanup in the `useEffect` return: cancel RAF, remove `resize`/`visibilitychange` listeners, delete the WebGL program/shaders/buffer.

**FlyingPlane (Three.js):**
- `WebGLRenderer({ alpha: true, antialias: true })`, `setClearColor(0x000000, 0)`, `scene.background = null` — fully transparent, DPR capped at 1.5x.
- `HemisphereLight` + a directional "sun" light; no scene background, no fog.
- **Boeing 737 built from primitives** (no `.glb`, per Non-goals): tapered capsule/cylinder fuselage with a blunt rounded nose (not a cone/spinner), swept-back box wings, **twin underwing cylinder engine nacelles** (the 737's identifying feature — this is what distinguishes it from a generic prop plane), a conventional low-mounted tail (vertical fin + horizontal stabilizers, not a T-tail). No propeller anywhere. Two-tone material: warm off-white body (`#f4efe3`-ish), amber accent trim (`#e8a13a`-ish) on the tail/engine trim, consistent with `DESIGN.md`'s palette.
- **Flight path:** not a simple left-to-right arc. Position is driven by a slow angle/radius sweep (sine/cosine, phase loosely matched to the shader's own timing scale) that curves the plane inward toward the same convergence point the shader's streaks radiate from/into (upper-middle-right of frame, based on the rendered preview), banking continuously into the turn with the nose tracking the velocity vector, and looping smoothly (fading in/out near the convergence point rather than resetting abruptly off-screen).
- Driven by a `THREE.Clock`, accumulating delta time (not frame counts), so pause/resume never teleports.
- Perspective camera positioned so the swirl crosses the upper third of the frame; very slight camera drift permitted.
- `resize` handler updates renderer size, camera aspect, and calls `updateProjectionMatrix()`.
- `prefers-reduced-motion`: park the plane mid-scene, one static render, no RAF.
- Pause RAF on `visibilitychange`; resume on visible (discard the paused time gap so the plane doesn't jump).
- Cleanup in the `useEffect` return: cancel RAF, remove `resize`/`visibilitychange` listeners, dispose every geometry and material, `renderer.dispose()`, remove the canvas from the DOM. Must survive React StrictMode's dev double-mount (mount → unmount → remount leaves exactly one live WebGL context) — verified during implementation by watching the browser console for "too many WebGL contexts" warnings across a few hot-reloads.
- Commented-out block showing the `.glb` swap path: drop a file in `/public`, `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'`, load `/plane.glb`, add the loaded scene to the group instead of the primitives (and dispose it in cleanup too).

**Compass relocation (Showcase.tsx):**
- The dial SVG (two concentric circles + needle `<g>` + center dot) and the JetBrains Mono bearing/distance/signal readout move into the "Find the bus" phone mockup card, replacing whatever static compass/arrow representation is there today.
- The needle-settle animation (`gsap.fromTo` rotate, `elastic.out` ease) is gated behind the same scroll-triggered reveal batch the rest of Showcase already uses, so it plays once when the card scrolls into view — not on page load.

## Data flow

No product/trip data involved — this is entirely the static marketing page. `ShaderSky` and `FlyingPlane` have no props and no external state; they're self-contained decorative layers. The relocated compass in `Showcase` also stays static/illustrative (it already was in the hero — fixed demo values, not live trip data).

## Testing / Verification

One bounded round (per the project's established pattern — build fully, inspect once, fix in one batch, confirm once, stop):
- Run the dev server, use Playwright to screenshot the hero at desktop (1440×900) and mobile (375×667).
- Confirm: the shader sky is visible behind the plane (no black box — transparency is working), the plane reads clearly as a Boeing 737 (twin underwing engines, no propeller) and not a gray box, its path visibly curves/converges rather than flying a flat line, the headline and both CTA buttons are legible and clickable (plane layer is `pointer-events: none`, z-order is sky/plane/content), and the browser console shows no WebGL or Three.js errors.
- Confirm the relocated compass renders correctly in the Showcase "Find the bus" card at both sizes, and its needle-settle animation fires on scroll-into-view.
- Reload the dev server / trigger a few hot-reloads and confirm no "too many WebGL contexts" console warning appears (validates cleanup in both `ShaderSky` and `FlyingPlane`).
- Fix anything found in one batch, re-screenshot to confirm, and stop — no open-ended polish loop.

## Open implementation questions for the plan

- Exact numeric tuning of the plane's swirl path (angle/radius/phase constants) and its convergence point's on-screen position — resolve visually during implementation against the actual rendered shader, not blind math.
- Whether the reduced-to-11 streak loop needs its remaining streak positions re-balanced (so the "gap" reads naturally rather than lopsided) — resolve by rendering and comparing during implementation.
- Whether `Showcase.tsx`'s existing "Find the bus" phone mockup card has enough room for the full dial (not just the small arrow it may show today) without breaking that card's layout at mobile widths — resolve during implementation; the phone-mockup frame's internal layout may need light adjustment.

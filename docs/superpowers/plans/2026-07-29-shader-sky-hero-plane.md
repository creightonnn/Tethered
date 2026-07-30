# Shader-Sky Hero with 3D Flying Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the marketing hero's ridge/compass background with a WebGL2 streak-shader sky (pine-green retint) plus a primitive-built Three.js Boeing 737 flying a path that echoes the shader's streaks, and relocate the existing compass dial into the Showcase "Find the bus" phone mockup.

**Architecture:** Two new self-contained decorative React components (`ShaderSky`, `FlyingPlane`) with no props/state, each owning a raw WebGL2 or Three.js render loop in a `useEffect`, mounted inside `Hero.tsx`'s existing `.mkt-hero__scene` layer in place of the SVG ridges/glow/compass. The compass dial markup and its needle-settle GSAP animation move from `Hero.tsx` into `Showcase.tsx`'s `MockFindBus`, re-themed for the light-paper phone mockup and re-gated on scroll-into-view instead of on-mount.

**Tech Stack:** React 19, TypeScript, raw WebGL2 (no shader library), `three` (new dependency), GSAP + `@gsap/react` + `ScrollTrigger` (already in use), Vite.

This is this project's established pattern (per `docs/superpowers/specs/2026-07-29-shader-hero-plane-design.md`): "build fully, inspect once, fix in one batch, confirm once, stop." There is no unit test framework in this repo (no Vitest/Jest configured) — verification throughout is a running dev server inspected with Playwright screenshots and console output, not automated tests.

## Global Constraints

- No Tailwind, no shadcn, no `components/ui` directory, no gradient-text headlines, no gradient-pill buttons — only the shader *technique* is adopted from the user's reference, not its literal styling.
- No change to hero copy, CTAs, eyebrow text, or button classes (`.mkt-btn--primary`/`.mkt-btn--outline`) — background/motion swap only.
- No change to Problem/Magic/Audience/FinalCTA marketing sections.
- No literal shared math between the GLSL shader (2D screen-space) and the Three.js scene (3D world-space) — the plane's path is tuned to visually rhyme with the shader, not derived from its formula.
- No `.glb` model — the 737 is built from primitives; a commented-out `GLTFLoader` swap path is included for future use.
- `prefers-reduced-motion` (via `src/lib/reducedMotion.ts`'s `prefersReducedMotion()`) freezes both the shader and the plane to a single static frame, no RAF loop.
- Both render loops pause on `visibilitychange` (tab hidden) and resume without a time-jump, and fully dispose all WebGL/Three.js resources on unmount (must survive React `StrictMode`'s dev double-mount — `src/main.tsx` uses `StrictMode`).
- Amber (`--amber-*`) stays a scarce UI accent (buttons, headline emphasis, trim) — the shader's cloud/background color itself is pine-green tinted, not amber, per `DESIGN.md`'s "signal flare" treatment of amber.

## File Structure

- `package.json` — add `three` + `@types/three` (new dependency).
- `src/marketing/ShaderSky.tsx` — new. WebGL2 fullscreen shader canvas (fbm/domain-warp clouds + 11-streak loop), pine-green retint.
- `src/marketing/FlyingPlane.tsx` — new. Transparent Three.js overlay: primitive-built 737, swirling/converging flight path, fade in/out per loop.
- `src/marketing/sections/Hero.tsx` — modified. Remove `RIDGE_LAYERS`, ridge SVG, glow div, compass block, needle GSAP animation; render `<ShaderSky />` + `<FlyingPlane />` inside `.mkt-hero__scene`.
- `src/marketing/sections/Showcase.tsx` — modified. `MockFindBus` gets the compass dial + bearing/distance/signal readout (re-themed for the light phone card), with the needle-settle animation gated on scroll-into-view.
- `src/marketing/marketing.css` — modified. Remove `.mkt-hero__glow`/`.mkt-hero__ridges`/`.mkt-hero__compass*`/`.mkt-hero__readout*` and their mobile override; add `.mkt-hero__shader-sky`/`.mkt-hero__flying-plane`; add `.showcase-compass*`.
- `src/marketing/Landing.tsx` — modified. Remove the two now-dead `ScrollTrigger` parallax tweens targeting `.mkt-hero__ridges` and `.mkt-hero__compass-inner`.

## Task 1: Add the `three` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `three` and its types**

Run:
```bash
npm install three@^0.185.1
npm install --save-dev @types/three@^0.185.1
```

- [ ] **Step 2: Verify the install**

Run: `npm ls three @types/three`
Expected: both list `0.185.x` with no `UNMET DEPENDENCY` warnings.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three.js dependency for hero flying plane"
```

---

## Task 2: `ShaderSky` — WebGL2 streak-cloud background

**Files:**
- Create: `src/marketing/ShaderSky.tsx`
- Modify: `src/marketing/marketing.css`
- Modify: `src/marketing/sections/Hero.tsx` (partial — swap glow/ridges for `<ShaderSky />`; compass stays for now, removed in Task 4)
- Modify: `src/marketing/Landing.tsx` (remove the ridges parallax tween)

**Interfaces:**
- Produces: `ShaderSky` — a zero-prop React component (`export function ShaderSky(): JSX.Element`) rendering a `<canvas className="mkt-hero__shader-sky">` that fills its positioned parent.

- [ ] **Step 1: Create `src/marketing/ShaderSky.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/reducedMotion'

const VERTEX_SRC = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Domain-warped cloud field (fbm-of-fbm-of-fbm), same structure as the
// user's shadcn/Tailwind reference component's clouds() function.
float clouds(vec2 p, float t) {
  vec2 q = vec2(fbm(p + t * 0.05), fbm(p + vec2(5.2, 1.3) + t * 0.03));
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.02),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.015)
  );
  return fbm(p + 4.0 * r);
}

// One soft anisotropic light streak, drifting slowly along its own axis.
float streak(vec2 uv, float seed, float t) {
  float angle = 0.4 + 0.15 * sin(t * 0.07 + seed * 12.9);
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  vec2 p = uv - vec2(0.5);
  float along = dot(p, dir);
  float across = dot(p, perp);
  float driftPhase = fract(seed * 0.61 + t * 0.05 + along * 0.15) - 0.5;
  float core = exp(-pow(across * 6.0 - driftPhase * 2.0, 2.0) * 40.0);
  float fade = smoothstep(0.85, 0.1, abs(along));
  return core * fade;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 2.4;

  float c = clouds(p, uTime);
  // --ink-950 (#0e1712) -> --green-800 (#14432e), pine-green retint of the
  // reference's orange/brown cloud mix.
  vec3 bgLow = vec3(0.055, 0.090, 0.071);
  vec3 bgHigh = vec3(0.078, 0.263, 0.180);
  vec3 bg = mix(bgLow, bgHigh, c);

  // 11 streaks (not 12): leaves room for the plane to read as occupying
  // the missing streak's position.
  float streaks = 0.0;
  for (int i = 0; i < 11; i++) {
    float seed = float(i) * 7.31;
    streaks += streak(uv, seed, uTime) * (0.55 + 0.45 * hash(vec2(seed, 1.0)));
  }
  streaks = clamp(streaks, 0.0, 1.0);

  // White-hot core, cool (teal) falloff — amber is deliberately not used
  // here; it's reserved as a scarce UI accent per DESIGN.md.
  vec3 streakCool = vec3(0.65, 0.89, 0.92);
  vec3 streakColor = mix(streakCool, vec3(1.0), streaks);
  vec3 color = bg + streakColor * streaks * 0.9;

  fragColor = vec4(color, 1.0);
}
`

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

export function ShaderSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uTime = gl.getUniformLocation(program, 'uTime')

    gl.useProgram(program)
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const reduced = prefersReducedMotion()
    let rafId = 0
    let startTime = performance.now()
    let pausedAt = 0

    function draw(t: number) {
      gl!.uniform1f(uTime, t)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.round(canvas!.clientWidth * dpr)
      const height = Math.round(canvas!.clientHeight * dpr)
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width
        canvas!.height = height
      }
      gl!.viewport(0, 0, width, height)
      gl!.uniform2f(uResolution, width, height)
    }

    function render(now: number) {
      draw((now - startTime) / 1000)
      rafId = requestAnimationFrame(render)
    }

    resize()

    if (reduced) {
      draw(0)
    } else {
      rafId = requestAnimationFrame(render)
    }

    function handleResize() {
      resize()
      if (reduced) draw(0)
    }

    function handleVisibility() {
      if (reduced) return
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        pausedAt = performance.now()
      } else {
        startTime += performance.now() - pausedAt
        rafId = requestAnimationFrame(render)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <canvas className="mkt-hero__shader-sky" ref={canvasRef} aria-hidden="true" />
}
```

- [ ] **Step 2: Add `ShaderSky`'s CSS and remove the old glow/ridges rules**

In `src/marketing/marketing.css`, delete the `.mkt-hero__glow` rule (lines 95–103) and the `.mkt-hero__ridges` rule (lines 105–112), and replace them with:

```css
.mkt-hero__shader-sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
```

- [ ] **Step 3: Wire `ShaderSky` into `Hero.tsx`, remove the ridge SVG and glow div**

In `src/marketing/sections/Hero.tsx`:
- Remove the `RIDGE_LAYERS` constant (lines 23–27).
- Add `import { ShaderSky } from '../ShaderSky'` near the top.
- Replace the `<div className="mkt-hero__glow" />` and the `<svg className="mkt-hero__ridges">...</svg>` block (lines 48–63) with:

```tsx
        <ShaderSky />
```

Leave the `.mkt-hero__compass` block, `sceneRef`, `needleRef`, and the needle `useGSAP` call untouched for now — they move out in Task 4.

- [ ] **Step 4: Remove the dead ridges parallax tween from `Landing.tsx`**

In `src/marketing/Landing.tsx`, delete this block (the `.mkt-hero__ridges` no longer exists):

```tsx
          gsap.to('.mkt-hero__ridges', {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: '.mkt-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          })
```

Leave the `.mkt-hero__compass-inner` tween directly below it untouched — it's removed in Task 4.

- [ ] **Step 5: Run the dev server and screenshot the hero**

Run: `npm run dev` (background), then with Playwright: navigate to the local URL, screenshot the hero at 1440×900 and at 375×667.

Expected: the hero background shows moving pine-green cloud texture with faint light streaks (no black canvas, no console errors), the compass is still present (unchanged from before), headline/CTAs are legible over the scrim. Also check that the 11-streak field reads as a natural, evenly-distributed light pattern rather than visibly lopsided or clumped — if it looks unbalanced, adjust the `7.31` seed multiplier in the fragment shader's streak loop (`float seed = float(i) * 7.31;`) to a value that spreads the per-streak angle/drift phases more evenly, and re-screenshot.

- [ ] **Step 6: Commit**

```bash
git add src/marketing/ShaderSky.tsx src/marketing/marketing.css src/marketing/sections/Hero.tsx src/marketing/Landing.tsx
git commit -m "feat: replace hero ridge background with WebGL2 shader sky"
```

---

## Task 3: `FlyingPlane` — primitive Three.js 737 on a swirling path

**Files:**
- Create: `src/marketing/FlyingPlane.tsx`
- Modify: `src/marketing/marketing.css`
- Modify: `src/marketing/sections/Hero.tsx`

**Interfaces:**
- Consumes: nothing from Task 2's `ShaderSky` (siblings, no shared state).
- Produces: `FlyingPlane` — a zero-prop React component (`export function FlyingPlane(): JSX.Element`) rendering a `<div className="mkt-hero__flying-plane">` containing a transparent Three.js canvas.

- [ ] **Step 1: Create `src/marketing/FlyingPlane.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/reducedMotion'

const LOOP_DURATION = 26
const MAX_RADIUS = 3.2
const LOOP_TURNS = 2.4
const MAX_BANK = THREE.MathUtils.degToRad(38)
// Upper-middle-right of frame, matched by eye against the shader's own
// streak convergence during implementation (see Step 4).
const CONVERGE = new THREE.Vector3(1.1, 1.0, -2.5)
const PHASE0 = Math.PI * 0.35
const FUSELAGE_LENGTH = 6.4

// Nose points toward local +Z, tail toward local -Z.
function buildPlane(): THREE.Group {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4efe3, roughness: 0.45, metalness: 0.08 })
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xe8a13a, roughness: 0.35, metalness: 0.12 })

  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.42, FUSELAGE_LENGTH, 16).rotateX(Math.PI / 2),
    bodyMat,
  )
  group.add(fuselage)

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), bodyMat)
  nose.scale.set(1, 1, 0.75)
  nose.position.z = FUSELAGE_LENGTH / 2 + 0.18
  group.add(nose)

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), bodyMat)
  tail.scale.set(1, 1, 0.9)
  tail.position.z = -FUSELAGE_LENGTH / 2 - 0.1
  group.add(tail)

  const wingGeo = new THREE.BoxGeometry(2.6, 0.08, 1.0)
  const rightWing = new THREE.Mesh(wingGeo, bodyMat)
  rightWing.position.set(1.5, -0.05, -0.2)
  rightWing.rotation.y = THREE.MathUtils.degToRad(22)
  group.add(rightWing)

  const leftWing = new THREE.Mesh(wingGeo, bodyMat)
  leftWing.position.set(-1.5, -0.05, -0.2)
  leftWing.rotation.y = THREE.MathUtils.degToRad(-22)
  group.add(leftWing)

  // Twin underwing engine nacelles — the 737's identifying feature.
  const engineGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.1, 12).rotateX(Math.PI / 2)
  const rightEngine = new THREE.Mesh(engineGeo, accentMat)
  rightEngine.position.set(1.3, -0.55, -0.1)
  group.add(rightEngine)

  const leftEngine = new THREE.Mesh(engineGeo, accentMat)
  leftEngine.position.set(-1.3, -0.55, -0.1)
  group.add(leftEngine)

  // Conventional low-mounted tail (not a T-tail): fin + stabilizers both
  // near the fuselage centerline, not stacked on top of each other.
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 1.1), accentMat)
  fin.position.set(0, 0.55, -FUSELAGE_LENGTH / 2 + 0.35)
  fin.rotation.x = THREE.MathUtils.degToRad(18)
  group.add(fin)

  const stabGeo = new THREE.BoxGeometry(1.5, 0.06, 0.6)
  const rightStab = new THREE.Mesh(stabGeo, bodyMat)
  rightStab.position.set(0.75, 0.05, -FUSELAGE_LENGTH / 2 + 0.15)
  rightStab.rotation.y = THREE.MathUtils.degToRad(8)
  group.add(rightStab)

  const leftStab = new THREE.Mesh(stabGeo, bodyMat)
  leftStab.position.set(-0.75, 0.05, -FUSELAGE_LENGTH / 2 + 0.15)
  leftStab.rotation.y = THREE.MathUtils.degToRad(-8)
  group.add(leftStab)

  // To swap in a real model later: drop a file at `/public/plane.glb` and
  // uncomment —
  // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
  // const loader = new GLTFLoader()
  // loader.load('/plane.glb', (gltf) => {
  //   group.clear()
  //   group.add(gltf.scene)
  // })

  return group
}

function pathPosition(t: number, out: THREE.Vector3): THREE.Vector3 {
  const envelope = Math.sin(Math.PI * t)
  const angle = PHASE0 + t * Math.PI * 2 * LOOP_TURNS
  const radius = MAX_RADIUS * envelope
  out.set(
    CONVERGE.x + radius * Math.cos(angle),
    CONVERGE.y + radius * Math.sin(angle) * 0.5,
    CONVERGE.z + radius * Math.sin(angle * 0.5) * 0.35,
  )
  return out
}

function pathAlpha(t: number): number {
  const fadeIn = THREE.MathUtils.smoothstep(t, 0, 0.08)
  const fadeOut = 1 - THREE.MathUtils.smoothstep(t, 0.92, 1)
  return fadeIn * fadeOut
}

export function FlyingPlane() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 1.6, 8)
    camera.lookAt(0.6, 1.1, -1)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2a20, 0.9))
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.1)
    sun.position.set(4, 6, 3)
    scene.add(sun)

    const plane = buildPlane()
    plane.scale.setScalar(0.32)
    scene.add(plane)

    const planeMaterials: THREE.MeshStandardMaterial[] = []
    plane.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial
        mat.transparent = true
        planeMaterials.push(mat)
      }
    })

    function resize() {
      const width = container!.clientWidth
      const height = container!.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    resize()

    const reduced = prefersReducedMotion()
    const clock = new THREE.Clock()
    let rafId = 0
    const currPos = new THREE.Vector3()
    const nextPos = new THREE.Vector3()

    function frame(elapsed: number) {
      const loopT = (elapsed % LOOP_DURATION) / LOOP_DURATION
      pathPosition(loopT, currPos)
      plane.position.copy(currPos)

      pathPosition((loopT + 0.01) % 1, nextPos)
      const velocity = nextPos.clone().sub(currPos)

      const yaw = Math.atan2(velocity.x, velocity.z)
      const horizontalSpeed = Math.hypot(velocity.x, velocity.z)
      const pitch = Math.atan2(-velocity.y, horizontalSpeed)
      const envelope = Math.sin(Math.PI * loopT)
      const bank = -MAX_BANK * envelope

      plane.rotation.set(0, 0, 0)
      plane.rotateY(yaw)
      plane.rotateX(pitch)
      plane.rotateZ(bank)

      const alpha = pathAlpha(loopT)
      for (const mat of planeMaterials) mat.opacity = alpha

      renderer.render(scene, camera)
    }

    function tick() {
      frame(clock.getElapsedTime())
      rafId = requestAnimationFrame(tick)
    }

    if (reduced) {
      pathPosition(0.5, currPos)
      plane.position.copy(currPos)
      for (const mat of planeMaterials) mat.opacity = 1
      renderer.render(scene, camera)
    } else {
      rafId = requestAnimationFrame(tick)
    }

    function handleResize() {
      resize()
      if (reduced) renderer.render(scene, camera)
    }

    function handleVisibility() {
      if (reduced) return
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        clock.stop()
      } else {
        // Resume without the elapsed-time gap: reuse the clock's own
        // internal timestamp instead of clock.start(), which would reset
        // elapsedTime to 0 and jump the plane back to the loop start.
        clock.oldTime = performance.now()
        clock.running = true
        rafId = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      plane.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose()
      })
      for (const mat of planeMaterials) mat.dispose()
      renderer.dispose()
      container!.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="mkt-hero__flying-plane" ref={containerRef} aria-hidden="true" />
}
```

- [ ] **Step 2: Add `FlyingPlane`'s CSS**

In `src/marketing/marketing.css`, add (near the `.mkt-hero__shader-sky` rule added in Task 2):

```css
.mkt-hero__flying-plane {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mkt-hero__flying-plane canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 3: Wire `FlyingPlane` into `Hero.tsx`, right after `ShaderSky`**

In `src/marketing/sections/Hero.tsx`, add `import { FlyingPlane } from '../FlyingPlane'` and render `<FlyingPlane />` immediately after `<ShaderSky />`:

```tsx
        <ShaderSky />
        <FlyingPlane />
```

- [ ] **Step 4: Run the dev server, screenshot, and visually tune the flight path**

Run: `npm run dev` (background), navigate with Playwright, screenshot the hero at 1440×900.

Confirm:
- The shader sky is visible behind the plane — no black box (transparency working).
- The plane reads clearly as a Boeing 737: twin underwing engines, no propeller, not a gray box.
- The plane flies nose-first along its path (not tail-leading) — if it looks backwards, the yaw sign is flipped; swap `Math.atan2(velocity.x, velocity.z)` for `Math.atan2(-velocity.x, -velocity.z)`.
- Its path visibly curves/spirals rather than flying a flat line, and it fades in/out near its convergence point rather than popping or resetting abruptly.
- The browser console shows no WebGL or Three.js errors.

If the plane is off-screen, too small, or poorly framed relative to the shader's streaks, adjust `CONVERGE`, `MAX_RADIUS`, or the camera's `position`/`lookAt` in `FlyingPlane.tsx` and re-screenshot. This tuning loop is expected — the spec explicitly leaves these constants for visual resolution against the rendered shader, not blind math.

- [ ] **Step 5: Confirm headline and CTAs are still interactive**

With Playwright, click "Try the live demo" and confirm navigation to `/app` still works (the plane layer is `pointer-events: none`, so it must not block clicks).

- [ ] **Step 6: Commit**

```bash
git add src/marketing/FlyingPlane.tsx src/marketing/marketing.css src/marketing/sections/Hero.tsx
git commit -m "feat: add 3D flying 737 overlay to marketing hero"
```

---

## Task 4: Relocate the compass into Showcase's "Find the bus" card

**Files:**
- Modify: `src/marketing/sections/Hero.tsx`
- Modify: `src/marketing/sections/Showcase.tsx`
- Modify: `src/marketing/marketing.css`
- Modify: `src/marketing/Landing.tsx`

**Interfaces:**
- Produces: `MockFindBus` (in `Showcase.tsx`) now renders the compass dial + readout instead of the plain triangle arrow.

- [ ] **Step 1: Remove the compass from `Hero.tsx`**

In `src/marketing/sections/Hero.tsx`, remove:
- The `needleRef` declaration and the `useGSAP` block that animates it (the whole `useGSAP(() => {...}, { scope: sceneRef })` call).
- The `<div className="mkt-hero__compass">...</div>` block.
- The now-unused imports: `useRef`, `gsap`, `useGSAP`, `prefersReducedMotion`.
- The `sceneRef` declaration and its `ref={sceneRef}` usage on `.mkt-hero__scene` (nothing else needs it once the needle animation is gone).

The file should reduce to:

```tsx
import { Link } from 'react-router-dom'
import { ShaderSky } from '../ShaderSky'
import { FlyingPlane } from '../FlyingPlane'

/*
  THESIS: "no one gets left behind" proven through the product's actual
  mechanism — a compass bearing to the bus — not a phone-mockup dashboard
  preview; refuses the generic "app screenshot in a hero card" template.
  OWN-WORLD: a WebGL streak-cloud sky over Tethered's pine-green palette,
  a 3D Boeing 737 flying a path that echoes the shader's own light-streaks,
  Domine headline carrying the product's own confirmed voice line. The
  compass now lives in the Showcase "Find the bus" mockup, where it has
  real product context.
  STORY: a reader sees the world the product operates in before reading a
  word of copy, then scrolls into the real Sapporo story below.
  FIRST VIEWPORT: full-bleed scene fills the hero; headline/sub/CTAs sit
  over it on the left, scrim-protected for contrast.
  FORM: brief-pinned redesign, direct build — extends the compass/
  breadcrumb cross-surface motif already committed in DESIGN.md.
*/

export function Hero() {
  return (
    <section className="mkt-hero">
      <div className="mkt-hero__scene" aria-hidden="true">
        <ShaderSky />
        <FlyingPlane />
      </div>

      <div className="mkt-hero__scrim" aria-hidden="true" />

      <div className="mkt-hero__content">
        <p className="eyebrow-mkt reveal-hero">For guided group tours</p>
        <h1 className="mkt-hero__headline reveal-hero">
          You're not lost.
          <br />
          <em>The bus is this way.</em>
        </h1>
        <p className="mkt-hero__sub reveal-hero">
          Save a pin while you've still got signal. Lose the signal, keep
          the way back. Tethered kept an 18-person tour together across
          Hokkaido — Sapporo malls, a Tokyo airport transfer — with no chat
          thread and no wifi required.
        </p>
        <div className="mkt-hero__ctas reveal-hero">
          <Link to="/app" className="mkt-btn mkt-btn--primary">
            Try the live demo
          </Link>
          <a href="mailto:hello@tethered.app" className="mkt-btn mkt-btn--outline">
            Bring it to your tours
          </a>
        </div>
        <p className="mkt-hero__offline reveal-hero">
          Built to keep working when the signal doesn't.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add the compass to `MockFindBus` in `Showcase.tsx`**

In `src/marketing/sections/Showcase.tsx`, add these imports at the top:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'
```

Replace the entire `MockFindBus` function (the triangle-arrow version) with:

```tsx
function MockFindBus() {
  const compassRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      if (!needleRef.current || prefersReducedMotion()) return
      gsap.fromTo(
        needleRef.current,
        { rotate: -68, transformOrigin: '50% 50%' },
        {
          rotate: -32,
          duration: 1.6,
          ease: 'elastic.out(1, 0.55)',
          delay: 0.3,
          scrollTrigger: {
            trigger: compassRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    { scope: compassRef },
  )

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="showcase-compass" ref={compassRef}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" fill="none" stroke="var(--paper-300)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="var(--paper-300)" strokeWidth="1" />
          <g ref={needleRef} style={{ transformBox: 'fill-box' }}>
            <path d="M100 26 L112 100 L100 92 L88 100 Z" fill="var(--amber-600)" />
            <path d="M100 174 L92 100 L100 108 L108 100 Z" fill="var(--ink-700)" />
          </g>
          <circle cx="100" cy="100" r="4.5" fill="var(--paper-50)" />
        </svg>
        <div className="showcase-compass__readout">
          <span>BEARING 214°</span>
          <span className="showcase-compass__readout-dot">·</span>
          <span>0.4 MI</span>
          <span className="showcase-compass__readout-dot">·</span>
          <span className="showcase-compass__readout-flag">NO SIGNAL</span>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', textAlign: 'center', marginTop: 14 }}>
        About a 4-minute walk. Head this way.
      </p>
    </div>
  )
}
```

(This replaces the old jumbo "350 m" readout with the compass's own "0.4 MI" so the two numbers don't disagree; the "About a 4-minute walk" caption stays.)

- [ ] **Step 3: Add `.showcase-compass*` CSS, remove the dead `.mkt-hero__compass*`/`.mkt-hero__readout*` rules**

In `src/marketing/marketing.css`:

Delete the `.mkt-hero__compass` rule, `.mkt-hero__compass-inner` rule, `.mkt-hero__readout` rule, `.mkt-hero__readout-dot` rule, and `.mkt-hero__readout-flag` rule (originally lines 114–155).

Delete the `.mkt-hero__compass` override inside the `@media (max-width: 900px)` block (originally lines 487–495), and reduce the now-oversized mobile hero bottom padding it existed to make room for:

```css
@media (max-width: 900px) {
  .mkt .mkt-hero {
    min-height: auto;
    padding: 120px 20px 80px;
  }
```

(was `padding: 120px 20px 340px` — that 340px reserved space for the compass repositioning to `bottom: 8%`, which no longer exists.)

Add, near `.showcase-phone`:

```css
.showcase-compass {
  width: 148px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.showcase-compass__readout {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--ink-700);
  background: var(--paper-200);
  border: 1px solid var(--paper-300);
  border-radius: 999px;
  padding: 6px 12px;
  white-space: nowrap;
}

.showcase-compass__readout-dot {
  color: var(--ink-500);
}

.showcase-compass__readout-flag {
  color: var(--amber-700);
  font-weight: 600;
}
```

- [ ] **Step 4: Remove the dead compass-inner parallax tween from `Landing.tsx`**

In `src/marketing/Landing.tsx`, delete this block (the `.mkt-hero__compass-inner` no longer exists in the hero):

```tsx
          gsap.to('.mkt-hero__compass-inner', {
            y: -70,
            rotate: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: '.mkt-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          })
```

- [ ] **Step 5: Run the dev server, screenshot, and confirm the scroll-triggered needle animation**

Run: `npm run dev` (background). With Playwright:
- Screenshot the hero at 1440×900 and 375×667 — confirm the compass is gone, headline/CTAs unaffected, and the mobile hero no longer has a huge empty gap at the bottom.
- Screenshot the Showcase "Find the bus" card at 1440×900 and 375×667 — confirm the compass dial + readout renders inside the phone frame without overflowing or breaking the card layout, and the needle starts at its `-68deg` pre-animation rotation before the card scrolls into view.
- Scroll the page so the "Find the bus" card enters the viewport, wait ~2s for the animation, screenshot again — confirm the needle has settled to its `-32deg` resting rotation.

- [ ] **Step 6: Commit**

```bash
git add src/marketing/sections/Hero.tsx src/marketing/sections/Showcase.tsx src/marketing/marketing.css src/marketing/Landing.tsx
git commit -m "feat: relocate compass from hero into Showcase find-the-bus card"
```

---

## Task 5: Final verification pass

**Files:** none (verification only; fixes go back into whichever file from Tasks 2–4 needs them).

- [ ] **Step 1: Full desktop + mobile screenshot pass**

With the dev server running, use Playwright to screenshot the full marketing page at 1440×900 and 375×667 (`fullPage: true`). Confirm against the spec's own acceptance criteria:
- Shader sky visible behind the plane, no black box.
- Plane reads as a 737 (twin underwing engines, no propeller), path curves/converges, fades in/out at its loop boundary.
- Headline, subhead, and both CTA buttons legible and clickable.
- Compass renders correctly inside the Showcase "Find the bus" card at both sizes.
- No visual regressions in Problem/Magic/Audience/FinalCTA sections.

- [ ] **Step 2: Console error check**

With Playwright, check `browser_console_messages` at `error` level after the full page has loaded and scrolled through. Expected: zero errors from this project's own code (a browser-extension "Could not establish connection" message, if present, is unrelated noise — confirm it doesn't come from `ShaderSky.tsx`/`FlyingPlane.tsx`/`Hero.tsx`/`Showcase.tsx` before dismissing it).

- [ ] **Step 3: `prefers-reduced-motion` check**

With Playwright, emulate `prefers-reduced-motion: reduce` (`page.emulateMedia({ reducedMotion: 'reduce' })`), reload, and screenshot the hero. Confirm: the shader shows a static (non-animated) cloud frame, the plane is parked mid-scene at full opacity (not faded/invisible), and the compass needle in Showcase does not animate on scroll (it should already be resting at whatever rotation the reduced-motion branch leaves it — no rotate applied — consistent with the pre-existing hero behavior being ported).

- [ ] **Step 4: WebGL context leak check via hot-reload**

With the dev server running and the hero visible in the browser, make a trivial whitespace edit to `ShaderSky.tsx`, save, check `browser_console_messages`; repeat for `FlyingPlane.tsx`, 3–4 times each. Expected: no "too many active WebGL contexts" (or similar) browser warning at any point — this validates the `useEffect` cleanup in both components actually runs and disposes GL/Three.js resources instead of leaking a context per remount. Revert the whitespace edits when done.

- [ ] **Step 5: Fix anything found, in one batch**

If Steps 1–4 surface issues, fix them all together, then re-run Steps 1–4 once to confirm. Do not start an open-ended polish loop — one fix batch, one re-confirmation, stop, per this project's established pattern.

- [ ] **Step 6: Commit (only if Step 5 required changes)**

```bash
git add -A
git commit -m "fix: address shader-sky hero verification findings"
```

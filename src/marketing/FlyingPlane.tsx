import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/reducedMotion'

const LOOP_DURATION = 26
// Fix round 1: original MAX_RADIUS/LOOP_TURNS/MAX_BANK combination spent
// most of the visible loop with the wings banked edge-on to the camera
// (measured via an offline Three.js projection sim, using the real
// on-page canvas rect — top 72/left 0/1424.67x828 at a 1440x900 viewport,
// not the naive full-viewport assumption — for accurate screen-space
// numbers). Median apparent wingspan was ~38px and unreadable ~54% of the
// time the plane was opaque. Tightening the radius/turns, easing the
// bank, and re-anchoring the convergence point keeps the wing-camera
// angle away from edge-on far more often (median wingspan ~91px,
// unreadable only ~4% of the time) while keeping the whole loop's
// on-screen bounding box (~x725-1013, y450-585 at 1440x900) clear of the
// headline/body copy column, the nav bar, and the CTA row.
const MAX_RADIUS = 1.5
const LOOP_TURNS = 1.4
const MAX_BANK = THREE.MathUtils.degToRad(34)
// Verification fix: the raw velocity-derived pitch swung to +-99deg (the
// path's vertical component briefly outpaces the horizontal one), pointing
// the nose almost straight up/down and reading as a missile/rocket rather
// than a cruising jet. Clamping keeps the curve/converge path and bank
// unchanged but stops the nose from tipping past a believable climb/dive.
const MAX_PITCH = THREE.MathUtils.degToRad(24)
// Verification fix: the camera's vertical FOV was fixed at 42deg, so on a
// narrow/portrait container (mobile hero) the *horizontal* FOV — which is
// derived from vertical FOV * aspect — shrank to ~18-23deg (vs ~67deg on
// the 1424x828 desktop reference CONVERGE/MAX_RADIUS were tuned against).
// That clipped almost the entire loop off the right edge of the frame on
// mobile. BASE_ASPECT/BASE_VFOV_DEG describe that reference frame; resize()
// widens the vertical FOV on narrower containers to hold the same
// horizontal field of view instead, so the path stays in frame.
const BASE_VFOV_DEG = 42
const BASE_ASPECT = 1424.67 / 828
// Upper-middle-right of frame, matched by eye against the shader's own
// streak convergence during implementation (see Step 4).
const CONVERGE = new THREE.Vector3(2.0, 1.0, -1.4)
const PHASE0 = Math.PI * 0.1
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

    const camera = new THREE.PerspectiveCamera(BASE_VFOV_DEG, 1, 0.1, 100)
    camera.position.set(0, 1.6, 8)
    camera.lookAt(0.6, 1.1, -1)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2a20, 0.9))
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.1)
    sun.position.set(4, 6, 3)
    scene.add(sun)

    const plane = buildPlane()
    // Fix round 1: bumped from 0.32 so the twin engines/wings read at a
    // legible size (median apparent wingspan ~91px vs ~38px at the old
    // scale, per the same projection sim referenced above).
    plane.scale.setScalar(0.58)
    scene.add(plane)

    // bodyMat/accentMat are shared across most meshes, so traversing every
    // mesh would collect duplicate entries — dedupe with a Set so the
    // per-frame opacity write and the cleanup dispose() each touch every
    // material exactly once.
    const planeMaterials = new Set<THREE.MeshStandardMaterial>()
    plane.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial
        mat.transparent = true
        planeMaterials.add(mat)
      }
    })

    function resize() {
      const width = container!.clientWidth
      const height = container!.clientHeight
      renderer.setSize(width, height, false)
      const aspect = width / Math.max(height, 1)
      camera.aspect = aspect
      if (aspect < BASE_ASPECT) {
        const baseHFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_VFOV_DEG) / 2) * BASE_ASPECT)
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(baseHFov / 2) / aspect))
      } else {
        camera.fov = BASE_VFOV_DEG
      }
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
      const rawPitch = Math.atan2(-velocity.y, horizontalSpeed)
      const pitch = THREE.MathUtils.clamp(rawPitch, -MAX_PITCH, MAX_PITCH)
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

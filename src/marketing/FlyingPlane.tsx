import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { prefersReducedMotion } from '../lib/reducedMotion'

const MODEL_URL = '/plane.glb'
// Longest horizontal (length or wingspan) dimension the model is
// normalized to, in world units.
const MODEL_TARGET_SPAN = 4.2

// Resting cruise pose, applied to a pivot separate from the live wobble
// below. SIDE PROFILE: level flight, wings horizontal, seen from the
// flank — 90deg yaw squares the fuselage to run left-to-right on screen.
const MODEL_YAW = THREE.MathUtils.degToRad(90)
const MODEL_PITCH = 0
const MODEL_ROLL = 0

const BASE_VFOV_DEG = 42
const BASE_Y = 0.6
const BASE_Z = -1.5
// Fraction of the half-frustum width at BASE_Z's depth: 0 = dead center,
// 1 = right at the frustum edge. Scales with aspect, so this stays
// "right-of-center" at any viewport width instead of clipping on mobile.
const BASE_X_FRACTION = 0.5

// Layered, non-synchronized oscillations (deliberately mismatched speeds
// so nothing lines up into an obvious loop) — the plane never travels, so
// this in-place bob/weave/bank is the entire "flying" effect.
const BOB_Y = 0.22
const WEAVE_X = 0.16
const DRIFT_Z = 0.14
const BANK_AMT = THREE.MathUtils.degToRad(11)
const PITCH_AMT = THREE.MathUtils.degToRad(4)
const YAW_AMT = THREE.MathUtils.degToRad(5)

function buildFallback(): THREE.Group {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4efe3, roughness: 0.5 })
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xe8a13a, roughness: 0.4 })

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 2.2, 8, 16).rotateZ(Math.PI / 2), bodyMat)
  group.add(fuselage)

  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 3.6), bodyMat)
  group.add(wing)

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.6), accentMat)
  fin.position.set(-1.3, 0.4, 0)
  group.add(fin)

  return group
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
    camera.position.set(0, 1.6, 9)
    camera.lookAt(0, 1.6, 0)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2c3a45, 1.0))
    const sun = new THREE.DirectionalLight(0xfff6e8, 1.2)
    sun.position.set(4, 6, 5)
    scene.add(sun)

    // plane (position + live wobble) -> modelPivot (fixed resting pose) ->
    // loaded 787 (or fallback, centered/scaled to a common size).
    const plane = new THREE.Group()
    scene.add(plane)
    const modelPivot = new THREE.Group()
    modelPivot.rotation.set(MODEL_PITCH, MODEL_YAW, MODEL_ROLL)
    plane.add(modelPivot)

    // Populated once the model (or fallback) is attached; the per-frame
    // opacity write and cleanup dispose() below both tolerate this being
    // empty until then.
    const planeMaterials = new Set<THREE.Material>()

    function collectMaterials(root: THREE.Object3D) {
      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          for (const mat of mats) {
            mat.transparent = true
            planeMaterials.add(mat)
          }
        }
      })
    }

    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        // Recenter so the model's own centroid sits at the rotation pivot,
        // then normalize scale so it reads at a consistent on-screen size.
        model.position.sub(center)
        const span = Math.max(size.x, size.z)
        model.scale.setScalar(MODEL_TARGET_SPAN / span)
        modelPivot.add(model)
        collectMaterials(model)
        if (reduced) {
          for (const mat of planeMaterials) mat.opacity = 1
          renderer.render(scene, camera)
        }
      },
      undefined,
      (err) => {
        console.warn('[FlyingPlane] /plane.glb failed to load; using fallback geometry.', err)
        const fallback = buildFallback()
        modelPivot.add(fallback)
        collectMaterials(fallback)
        if (reduced) {
          for (const mat of planeMaterials) mat.opacity = 1
          renderer.render(scene, camera)
        }
      },
    )

    let baseX = 2.5

    function computeBaseX() {
      const dist = camera.position.z - BASE_Z
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist * camera.aspect
      baseX = halfWidth * BASE_X_FRACTION
    }

    function resize() {
      const width = container!.clientWidth
      // The hero section's height is content-driven and can run well
      // taller than the viewport (long wrapped headline/subtitle on
      // mobile) since it's an absolutely-positioned inset:0 overlay. The
      // plane's vertical position is a fixed fraction of this height, so
      // capping it to the viewport keeps the plane inside the first fold
      // instead of parking it below the visible area on narrow screens.
      const visibleBelowTop = window.innerHeight - container!.getBoundingClientRect().top
      const height = Math.min(container!.clientHeight, Math.max(visibleBelowTop, 240))
      renderer.setSize(width, height, true)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      computeBaseX()
    }
    resize()

    const reduced = prefersReducedMotion()

    function apply(t: number) {
      plane.position.set(
        baseX + Math.sin(t * 0.37) * WEAVE_X + Math.sin(t * 0.11 + 1.7) * WEAVE_X * 0.4,
        BASE_Y + Math.sin(t * 0.53) * BOB_Y + Math.sin(t * 0.19 + 1.3) * BOB_Y * 0.5,
        BASE_Z + Math.sin(t * 0.29 + 0.7) * DRIFT_Z,
      )
      plane.rotation.set(
        Math.sin(t * 0.31 + 0.5) * PITCH_AMT,
        Math.sin(t * 0.23 + 2.1) * YAW_AMT,
        Math.sin(t * 0.43) * BANK_AMT + Math.sin(t * 0.17 + 0.9) * BANK_AMT * 0.35,
      )
      const alpha = THREE.MathUtils.smoothstep(t, 0, 0.6)
      for (const mat of planeMaterials) mat.opacity = alpha
    }

    const clock = new THREE.Clock()
    let rafId = 0

    function frame() {
      apply(clock.getElapsedTime())
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(frame)
    }

    if (reduced) {
      apply(1)
      renderer.render(scene, camera)
    } else {
      rafId = requestAnimationFrame(frame)
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
        // elapsedTime to 0 and jump the plane back to its start pose.
        clock.oldTime = performance.now()
        clock.running = true
        rafId = requestAnimationFrame(frame)
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

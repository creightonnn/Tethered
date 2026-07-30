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

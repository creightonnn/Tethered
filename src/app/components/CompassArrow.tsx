import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

export function CompassArrow({
  bearing,
  heading,
  size = 120,
}: {
  bearing: number
  heading: number | null
  size?: number
}) {
  const rotation = bearing - (heading ?? 0)
  const arrowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!arrowRef.current) return
      gsap.to(arrowRef.current, {
        rotation,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power2.out',
        transformOrigin: 'center center',
      })
    },
    { dependencies: [rotation], scope: arrowRef },
  )

  return (
    <div className="compass__arrow" ref={arrowRef}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 8 L74 62 L50 48 L26 62 Z" fill="currentColor" />
      </svg>
    </div>
  )
}

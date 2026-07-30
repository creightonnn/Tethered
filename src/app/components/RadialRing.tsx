import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

export function RadialRing({
  percent,
  color = 'var(--accent)',
  track = 'var(--line)',
  size = 108,
  children,
}: {
  percent: number
  color?: string
  track?: string
  size?: number
  children?: React.ReactNode
}) {
  const r = (size / 108) * 46
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, percent))
  const circleRef = useRef<SVGCircleElement>(null)

  useGSAP(
    () => {
      if (!circleRef.current) return
      gsap.to(circleRef.current, {
        strokeDashoffset: c * (1 - clamped),
        duration: prefersReducedMotion() ? 0 : 0.6,
        ease: 'power2.out',
      })
    },
    { dependencies: [clamped], scope: circleRef },
  )

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth="8" />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function useCountdown(targetIso: string) {
  const now = useNow(1000)
  const diffMs = new Date(targetIso).getTime() - now
  const overdue = diffMs <= 0
  const totalMinutes = Math.floor(Math.abs(diffMs) / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const display = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`

  return { overdue, display, hours, minutes, totalMinutes }
}

export function DepartureCountdown({
  label,
  targetIso,
}: {
  label: string
  targetIso: string
}) {
  const { overdue, display } = useCountdown(targetIso)
  const valueRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (!valueRef.current) return
      gsap.fromTo(
        valueRef.current,
        { scale: 1.06 },
        { scale: 1, duration: prefersReducedMotion() ? 0 : 0.35, ease: 'power2.out' },
      )
    },
    { dependencies: [display], scope: valueRef },
  )

  return (
    <div className="countdown">
      <p className="countdown__label">
        {overdue ? 'The group left' : label}
      </p>
      <p className="countdown__value" ref={valueRef}>
        {overdue ? 'already' : display}
      </p>
      {!overdue && (
        <p className="countdown__sub">You've got plenty of time.</p>
      )}
    </div>
  )
}

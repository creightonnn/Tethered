import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { prefersReducedMotion } from '../../lib/reducedMotion'

export default function RollCall() {
  const { trip, checkIn } = useTrip()
  const me = trip.roster[0]
  const done = me?.checkedIn ?? false

  const btnRef = useRef<HTMLButtonElement>(null)
  const checkRef = useRef<SVGPathElement>(null)

  useGSAP(
    () => {
      if (!done || !btnRef.current) return
      if (prefersReducedMotion()) return

      gsap.fromTo(
        btnRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.45, ease: 'power2.out' },
      )

      if (checkRef.current) {
        const length = checkRef.current.getTotalLength()
        gsap.fromTo(
          checkRef.current,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 },
        )
      }
    },
    { dependencies: [done], scope: btnRef },
  )

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Roll call" />

      {!trip.rollCallActive ? (
        <p className="compass__instruction" style={{ textAlign: 'center', marginTop: 40 }}>
          No roll call running right now.
        </p>
      ) : (
        <>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              marginBottom: 8,
            }}
          >
            Your guide is checking who's here.
          </p>
          <div className="rollcall-tap">
            <button
              type="button"
              className="rollcall-tap__btn"
              data-done={done}
              ref={btnRef}
              onClick={() => checkIn(me.id)}
            >
              {done ? (
                <span className="rollcall-tap__confirm">
                  You're here
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      ref={checkRef}
                      d="M5 12.5L10 17.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                "I'm here"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

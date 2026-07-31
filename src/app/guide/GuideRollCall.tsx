import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { prefersReducedMotion } from '../../lib/reducedMotion'

export default function GuideRollCall() {
  const { trip, startRollCall, endRollCall, simulateCheckIns, toggleCheckIn } = useTrip()
  const checkedIn = trip.roster.filter((m) => m.checkedIn)
  const missing = trip.roster.filter((m) => !m.checkedIn)

  const tallyRef = useRef<HTMLParagraphElement>(null)
  const displayedRef = useRef(checkedIn.length)

  useGSAP(
    () => {
      if (!tallyRef.current) return
      const counter = { val: displayedRef.current }
      gsap.to(counter, {
        val: checkedIn.length,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power1.out',
        onUpdate: () => {
          if (tallyRef.current) {
            tallyRef.current.textContent = `${Math.round(counter.val)} of ${trip.roster.length} here`
          }
        },
        onComplete: () => {
          displayedRef.current = checkedIn.length
        },
      })
    },
    { dependencies: [checkedIn.length], scope: tallyRef },
  )

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Roll call" />

      {!trip.rollCallActive ? (
        <div className="stack">
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Everyone's phone will show one big button: "I'm here." Watch the
            count fill in below.
          </p>
          <Button block onClick={startRollCall}>
            Start roll call
          </Button>
        </div>
      ) : (
        <>
          <div className="rollcall-tally">
            <p className="rollcall-tally__count" ref={tallyRef}>
              {checkedIn.length} of {trip.roster.length} here
            </p>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 10 }}>
            Tap a name to check someone in yourself — tap again to undo.
          </p>
          <div className="card" style={{ marginBottom: 14 }}>
            {trip.roster.map((m, i) => (
              <button
                type="button"
                className="roster-row"
                data-checked={m.checkedIn}
                aria-label={m.checkedIn ? `Check out ${m.name}` : `Check in ${m.name}`}
                onClick={() => toggleCheckIn(m.id)}
                key={m.id}
              >
                <span>
                  {m.name}
                  {i === 0 ? ' (you)' : ''}
                </span>
                <span className="roster-row__dot" aria-hidden />
              </button>
            ))}
          </div>

          {missing.length > 0 && missing.length < trip.roster.length && (
            <div className="instruction-callout" style={{ marginBottom: 14 }}>
              Still missing: {missing.map((m) => m.name).join(', ')}
            </div>
          )}

          <div className="stack">
            <Button variant="secondary" block onClick={simulateCheckIns}>
              Simulate check-ins (demo)
            </Button>
            <Button variant="ghost" block onClick={endRollCall}>
              End roll call
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

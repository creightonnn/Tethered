import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

export default function GuideRollCall() {
  const { trip, startRollCall, endRollCall, simulateCheckIns } = useTrip()
  const checkedIn = trip.roster.filter((m) => m.checkedIn)
  const missing = trip.roster.filter((m) => !m.checkedIn)

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
            <p className="rollcall-tally__count">
              {checkedIn.length} of {trip.roster.length} here
            </p>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            {trip.roster.map((m) => (
              <div className="roster-row" data-checked={m.checkedIn} key={m.id}>
                <span>{m.name}</span>
                <span className="roster-row__dot" aria-hidden />
              </div>
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

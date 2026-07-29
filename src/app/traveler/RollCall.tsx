import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'

export default function RollCall() {
  const { trip, checkIn } = useTrip()
  const me = trip.roster[0]
  const done = me?.checkedIn ?? false

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
              onClick={() => checkIn(me.id)}
            >
              {done ? "You're here ✓" : "I'm here"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

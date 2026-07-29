import { useTrip } from '../../lib/TripProvider'
import { LinkButton } from '../components/Button'
import { StatTile } from '../components/StatTile'
import { useCountdown } from '../components/Countdown'

export default function GuideHome() {
  const { trip, leave } = useTrip()
  const { display, overdue } = useCountdown(trip.departureAt)
  const checkedIn = trip.roster.filter((m) => m.checkedIn)
  const missing = trip.roster.filter((m) => !m.checkedIn)

  return (
    <div className="screen screen--pad-top">
      <div className="topbar">
        <h1 className="topbar__title">{trip.name}</h1>
      </div>

      <div className="stat-grid">
        <StatTile
          label="Roll call"
          value={
            trip.rollCallActive
              ? `${checkedIn.length} of ${trip.roster.length}`
              : 'Not running'
          }
          tone={
            trip.rollCallActive && checkedIn.length === trip.roster.length
              ? 'good'
              : trip.rollCallActive
                ? 'warn'
                : 'neutral'
          }
        />
        <StatTile
          label={trip.departureLabel}
          value={overdue ? 'Departed' : display}
        />
        <StatTile label="Bus pin" value={trip.busPin ? 'Set' : 'Not set'} />
      </div>

      {trip.rollCallActive && missing.length > 0 && (
        <div className="instruction-callout" style={{ marginBottom: 14 }}>
          Still missing: {missing.map((m) => m.name).join(', ')}
        </div>
      )}

      <div className="stack" style={{ marginTop: 4 }}>
        <LinkButton to="/app/guide/pin" block>
          Set the bus pin
        </LinkButton>
        <LinkButton to="/app/guide/departure" variant="secondary" block>
          Set departure time
        </LinkButton>
        <LinkButton to="/app/guide/meeting-point" variant="secondary" block>
          Set meeting point
        </LinkButton>
        <LinkButton to="/app/guide/announce" variant="secondary" block>
          Post an announcement
        </LinkButton>
        <LinkButton to="/app/guide/roll-call" variant="secondary" block>
          Run roll call
        </LinkButton>
      </div>

      <div className="demo-link">
        <button type="button" onClick={leave}>
          Leave trip (demo)
        </button>
      </div>
    </div>
  )
}

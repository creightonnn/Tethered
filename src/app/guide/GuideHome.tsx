import { useTrip } from '../../lib/TripProvider'
import { LinkButton } from '../components/Button'
import { useCountdown } from '../components/Countdown'

export default function GuideHome() {
  const { trip, leave } = useTrip()
  const { display, overdue } = useCountdown(trip.departureAt)
  const checkedIn = trip.roster.filter((m) => m.checkedIn).length

  return (
    <div className="screen screen--pad-top">
      <div className="topbar">
        <h1 className="topbar__title">{trip.name}</h1>
      </div>

      <div className="card">
        <div className="info-row">
          <span className="info-row__label">{trip.departureLabel}</span>
          <span className="info-row__value">
            {overdue ? 'departed' : display}
          </span>
        </div>
        <div className="info-row">
          <span className="info-row__label">Bus pin</span>
          <span className="info-row__value">
            {trip.busPin ? 'Set' : 'Not set'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-row__label">Roll call</span>
          <span className="info-row__value">
            {trip.rollCallActive
              ? `${checkedIn} of ${trip.roster.length} here`
              : 'Not running'}
          </span>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
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
          Switch role (demo)
        </button>
      </div>
    </div>
  )
}

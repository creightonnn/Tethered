import { Link } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { DepartureCountdown } from '../components/Countdown'
import { LinkButton } from '../components/Button'

export default function Home() {
  const { trip, leave } = useTrip()

  return (
    <div className="screen screen--pad-top">
      <div className="topbar">
        <h1 className="topbar__title">{trip.name}</h1>
      </div>

      {trip.rollCallActive && (
        <Link
          to="/app/roll-call"
          className="announcement"
          style={{ textDecoration: 'none', marginBottom: 14 }}
        >
          <span className="announcement__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="announcement__body">
            <span className="announcement__eyebrow">Roll call</span>
            Your guide is checking who's here. Tap to say "I'm here."
          </span>
        </Link>
      )}

      {trip.announcement && (
        <div className="announcement" style={{ marginBottom: 14 }}>
          <span className="announcement__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 10a8 8 0 0116 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M9 20a3 3 0 006 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="announcement__body">
            <span className="announcement__eyebrow">From your guide</span>
            {trip.announcement.text}
          </span>
        </div>
      )}

      <div className="card">
        <DepartureCountdown
          label={trip.departureLabel}
          targetIso={trip.departureAt}
        />
      </div>

      <div style={{ marginTop: 22 }}>
        <LinkButton to="/app/find-bus" huge block>
          Find the bus
        </LinkButton>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <LinkButton to="/app/today" variant="secondary" block>
          Today
        </LinkButton>
        {trip.meetingPoint && (
          <LinkButton to="/app/meeting-point" variant="secondary" block>
            Meeting point: {trip.meetingPoint.label}
          </LinkButton>
        )}
      </div>

      <div className="demo-link">
        <button type="button" onClick={leave}>
          Leave trip (demo)
        </button>
      </div>
    </div>
  )
}

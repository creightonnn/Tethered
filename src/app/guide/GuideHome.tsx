import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTrip } from '../../lib/TripProvider'
import { LinkButton } from '../components/Button'
import { RadialRing } from '../components/RadialRing'
import { TopoBackground } from '../components/TopoBackground'
import { MapView } from '../components/MapView'
import { useCountdown } from '../components/Countdown'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import type { Trip } from '../../lib/tripTypes'

const ICONS: Record<string, string> = {
  rollcall: 'M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z',
  pin: 'M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3',
  flag: 'M5 3v18M5 4h11l-2.5 3.5L16 11H5',
  megaphone: 'M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM17 8a3 3 0 010 8',
  chevron: 'M6 9l6 6 6-6',
}

function ActionIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg
      className="gd-disclosure__chevron"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d={ICONS.chevron} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Its own component (not inlined in GuideHome) so useCountdown's interval
 * only runs while a meeting point actually exists, and so the hook isn't
 * called conditionally inside GuideHome's own render. */
function MeetingPointPreview({ point }: { point: NonNullable<Trip['meetingPoint']> }) {
  const { overdue, display } = useCountdown(point.time)
  return (
    <div className="gd-disclosure__body">
      <p style={{ fontSize: '1.05rem' }}>{point.label}</p>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
        {overdue ? 'Time to regroup' : `in ${display}`}
      </p>
    </div>
  )
}

export default function GuideHome() {
  const { trip, leave } = useTrip()
  const { display, overdue } = useCountdown(trip.departureAt)
  const checkedIn = trip.roster.filter((m) => m.checkedIn)
  const missing = trip.roster.filter((m) => !m.checkedIn)
  const allIn = trip.rollCallActive && missing.length === 0

  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.gd-reveal',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07 },
      )
    },
    { scope: rootRef },
  )

  return (
    <div className="screen screen--pad-top gd" ref={rootRef}>
      <TopoBackground />

      <header className="gd-header gd-reveal">
        <div className="gd-header__eyebrow">
          <span className="gd-live-dot" aria-hidden="true" />
          Live
        </div>
        <h1 className="topbar__title">{trip.name}</h1>
        {trip.guideNames.length > 0 && (
          <p className="gd-header__guides">Guiding: {trip.guideNames.join(' & ')}</p>
        )}
      </header>

      <div className="gd-cluster gd-reveal">
        <div className="gd-gauge">
          <RadialRing
            percent={trip.rollCallActive ? checkedIn.length / trip.roster.length : 0}
            color={allIn ? 'var(--success)' : 'var(--accent)'}
            size={92}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
              {trip.rollCallActive ? `${checkedIn.length}/${trip.roster.length}` : '—'}
            </span>
          </RadialRing>
          <p className="gd-gauge__label" style={{ marginTop: 8 }}>
            Roll call
          </p>
        </div>

        <div className="gd-gauge gd-gauge--hero gd-notch">
          <p className="gd-gauge__label">{trip.departureLabel}</p>
          <p className="gd-gauge__value">{overdue ? 'Departed' : display}</p>
          {!overdue && <p className="gd-gauge__sub">You've got plenty of time</p>}
        </div>

        <div className="gd-gauge">
          <div
            className="gd-gauge__pin-icon"
            style={{ background: trip.busPin ? 'var(--success-bg)' : 'var(--warning-bg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={ICONS.pin}
                stroke={trip.busPin ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="gd-gauge__label">Bus pin</p>
          <p className="gd-gauge__value" style={{ fontSize: '1.05rem' }}>
            {trip.busPin ? 'Set' : 'Not set'}
          </p>
        </div>

        <div className="gd-gauge">
          <div
            className="gd-gauge__pin-icon"
            style={{ background: trip.meetingPoint ? 'var(--success-bg)' : 'var(--warning-bg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={ICONS.flag}
                stroke={trip.meetingPoint ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="gd-gauge__label">Meeting pt</p>
          <p className="gd-gauge__value" style={{ fontSize: '1.05rem' }}>
            {trip.meetingPoint ? 'Set' : 'Not set'}
          </p>
        </div>
      </div>

      {trip.busPin && (
        <div className="gd-map-section gd-reveal">
          <p className="eyebrow">On the map</p>
          <MapView
            busPin={trip.busPin}
            meetingPoint={trip.meetingPoint}
            position={null}
            height={180}
          />
        </div>
      )}

      {trip.announcement && (
        <details className="gd-disclosure gd-reveal">
          <summary>
            <span className="eyebrow" style={{ margin: 0 }}>Current announcement</span>
            <Chevron />
          </summary>
          <p className="gd-disclosure__body">{trip.announcement.text}</p>
        </details>
      )}

      {trip.meetingPoint && (
        <details className="gd-disclosure gd-reveal">
          <summary>
            <span className="eyebrow" style={{ margin: 0 }}>Meeting point</span>
            <Chevron />
          </summary>
          <MeetingPointPreview point={trip.meetingPoint} />
        </details>
      )}

      {trip.rollCallActive && missing.length > 0 && (
        <div className="gd-alert gd-reveal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.3 3.9L2.7 17.5A2 2 0 004.5 20.5h15A2 2 0 0021.3 17.5L13.7 3.9a2 2 0 00-3.4 0z"
              stroke="var(--warning)"
              strokeWidth="1.8"
            />
          </svg>
          <span>
            <strong>{missing.length} still checking in:</strong> {missing.map((m) => m.name).join(', ')}
          </span>
        </div>
      )}

      <nav className="gd-console gd-reveal" aria-label="Guide actions">
        <LinkButton to="/app/guide/roll-call" className="gd-console__btn gd-console__btn--primary">
          <ActionIcon name="rollcall" />
          Roll call
        </LinkButton>
        <LinkButton to="/app/guide/pin" className="gd-console__btn">
          <ActionIcon name="pin" />
          Bus pin
        </LinkButton>
        <LinkButton to="/app/guide/departure" className="gd-console__btn">
          <ActionIcon name="clock" />
          Departure
        </LinkButton>
        <LinkButton to="/app/guide/meeting-point" className="gd-console__btn">
          <ActionIcon name="flag" />
          Meeting pt
        </LinkButton>
        <LinkButton to="/app/guide/announce" className="gd-console__btn">
          <ActionIcon name="megaphone" />
          Announce
        </LinkButton>
      </nav>

      <div className="demo-link">
        <button type="button" onClick={leave}>
          Leave trip (demo)
        </button>
      </div>
    </div>
  )
}

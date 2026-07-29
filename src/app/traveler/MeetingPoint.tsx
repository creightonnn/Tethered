import { useEffect, useState } from 'react'
import { useTrip } from '../../lib/TripProvider'
import { useGeolocation } from '../../lib/useGeolocation'
import { useCompassHeading } from '../../lib/useCompassHeading'
import {
  bearingDegrees,
  distanceMeters,
  formatDistance,
  walkingLabel,
} from '../../lib/geo'
import { TopBar } from '../components/TopBar'
import { CompassArrow } from '../components/CompassArrow'
import { useCountdown } from '../components/Countdown'
import { OfflineBadge } from '../components/OfflineBadge'

export default function MeetingPoint() {
  const { trip } = useTrip()
  const point = trip.meetingPoint

  const real = useGeolocation(true)
  const heading = useCompassHeading(true)
  const { overdue, display } = useCountdown(point?.time ?? new Date().toISOString())

  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  if (!point) {
    return (
      <div className="screen screen--pad-top">
        <TopBar title="Meeting point" />
        <p className="compass__instruction">No meeting point set right now.</p>
      </div>
    )
  }

  const position = real.position
  const distance = position ? distanceMeters(position, point) : null
  const bearing = position ? bearingDegrees(position, point) : 0

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Meeting point" />
      <OfflineBadge />

      <div className="card" style={{ textAlign: 'center' }}>
        <p className="eyebrow">Regroup at {point.label}</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 600 }}>
          {overdue ? "It's time" : `in ${display}`}
        </p>
      </div>

      <div className="compass">
        {!position ? (
          <>
            <div className="compass__arrow-wrap">
              <CompassArrow bearing={0} heading={null} />
            </div>
            <p className="compass__instruction">
              {ready && real.error
                ? "Can't get your location right now."
                : 'Finding your position…'}
            </p>
          </>
        ) : (
          <>
            <div className="compass__arrow-wrap">
              <CompassArrow bearing={bearing} heading={heading} />
            </div>
            <p className="compass__distance">
              {distance !== null ? formatDistance(distance) : '—'}
            </p>
            <p className="compass__instruction">
              {distance !== null ? walkingLabel(distance) : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

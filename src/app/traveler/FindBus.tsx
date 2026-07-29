import { useEffect, useState } from 'react'
import { useTrip } from '../../lib/TripProvider'
import { useGeolocation } from '../../lib/useGeolocation'
import {
  requestCompassPermission,
  useCompassHeading,
} from '../../lib/useCompassHeading'
import { useDemoWalk } from '../../lib/useDemoWalk'
import { dropCrumb, getTrail, clearTrail } from '../../lib/breadcrumb'
import {
  bearingDegrees,
  distanceMeters,
  formatDistance,
  walkingLabel,
} from '../../lib/geo'
import { TopBar } from '../components/TopBar'
import { CompassArrow } from '../components/CompassArrow'
import { Button } from '../components/Button'
import { OfflineBadge } from '../components/OfflineBadge'
import { MapView } from '../components/MapView'

export default function FindBus() {
  const { trip } = useTrip()
  const pin = trip.busPin

  const demo = useDemoWalk(pin ? { lat: pin.lat, lng: pin.lng } : null)
  const real = useGeolocation(!demo.active)
  const [compassAllowed, setCompassAllowed] = useState(false)
  const heading = useCompassHeading(compassAllowed)

  const position = demo.active ? demo.position : real.position
  const [trailLength, setTrailLength] = useState(() => getTrail().length)

  useEffect(() => {
    if (!position) return
    const trail = dropCrumb(position)
    setTrailLength(trail.length)
  }, [position])

  if (!pin) {
    return (
      <div className="screen screen--pad-top">
        <TopBar title="Find the bus" />
        <div className="compass">
          <p className="compass__instruction">
            Your guide hasn't dropped a pin yet. Once they do, you'll be able
            to find your way back from anywhere.
          </p>
        </div>
      </div>
    )
  }

  const distance = position ? distanceMeters(position, pin) : null
  const bearing = position ? bearingDegrees(position, pin) : 0

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Find the bus" />
      <OfflineBadge />

      <MapView busPin={pin} position={position} />

      <div className="compass">
        {!position ? (
          <>
            <div className="compass__arrow-wrap">
              <CompassArrow bearing={0} heading={null} />
            </div>
            <p className="compass__instruction">
              {real.error
                ? "Can't get your location right now. Move somewhere with a clearer view of the sky."
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
            <p className="compass__note">{pin.note}</p>
          </>
        )}
      </div>

      {!compassAllowed && (
        <Button
          variant="secondary"
          block
          onClick={async () => setCompassAllowed(await requestCompassPermission())}
        >
          Turn on compass
        </Button>
      )}

      <div className="stack" style={{ marginTop: 14 }}>
        {trailLength > 1 && (
          <Button
            variant="secondary"
            block
            onClick={() => demo.retraceSteps()}
          >
            Retrace my steps
          </Button>
        )}

        <div
          style={{
            marginTop: 8,
            paddingTop: 14,
            borderTop: '1px solid var(--line)',
          }}
        >
          <p className="eyebrow" style={{ textAlign: 'center' }}>
            Demo mode
          </p>
          <div className="stack">
            {!demo.active ? (
              <Button variant="secondary" block onClick={demo.startWalking}>
                Simulate walking away
              </Button>
            ) : (
              <Button variant="secondary" block onClick={demo.stop}>
                Stop simulated walk
              </Button>
            )}
            <Button
              variant="ghost"
              block
              onClick={() => {
                demo.reset()
                clearTrail()
                setTrailLength(0)
              }}
            >
              Reset demo walk
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

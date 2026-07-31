import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { useGeolocation } from '../../lib/useGeolocation'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

/** Same reasoning as SetDeparture.tsx's minutesRemaining: show time
 * actually left on the current meeting point instead of always resetting
 * to a hardcoded default when this screen is reopened. */
function minutesRemaining(time: string): number {
  const ms = new Date(time).getTime() - Date.now()
  return Math.max(1, Math.round(ms / 60_000))
}

export default function SetMeetingPoint() {
  const { trip, setMeetingPoint } = useTrip()
  const { position, error } = useGeolocation(true)
  const [label, setLabel] = useState(trip.meetingPoint?.label ?? '')
  const [minutes, setMinutes] = useState(
    trip.meetingPoint?.time ? minutesRemaining(trip.meetingPoint.time) : 20,
  )
  const navigate = useNavigate()

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set meeting point" />

      <p style={{ color: 'var(--text-muted)', marginBottom: 18, fontSize: '1.05rem' }}>
        Use this for a regroup that isn't the bus: a fountain, a shop
        entrance, anywhere the group scatters from.
      </p>

      <div className="stack">
        <label className="eyebrow" htmlFor="label">
          Where
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Fountain by Bay 4"
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.15rem',
            padding: '0 16px',
            color: 'var(--text)',
          }}
        />

        <label className="eyebrow" htmlFor="minutes">
          Minutes from now
        </label>
        <input
          id="minutes"
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          style={{
            minHeight: 64,
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.5rem',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            color: 'var(--text)',
          }}
        />

        {error && (
          <p style={{ color: 'var(--warning)' }}>
            Can't get your location: {error}
          </p>
        )}

        <Button
          block
          disabled={!position || !label}
          onClick={() => {
            if (!position) return
            setMeetingPoint({
              label,
              lat: position.lat,
              lng: position.lng,
              time: new Date(Date.now() + minutes * 60_000).toISOString(),
            })
            navigate('/app/guide')
          }}
        >
          Set meeting point here
        </Button>

        {trip.meetingPoint && (
          <Button
            variant="ghost"
            block
            onClick={() => {
              setMeetingPoint(null)
              navigate('/app/guide')
            }}
          >
            Clear meeting point
          </Button>
        )}
      </div>
    </div>
  )
}

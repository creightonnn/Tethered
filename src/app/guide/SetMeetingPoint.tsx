import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { LocationPicker } from '../components/LocationPicker'
import type { LatLng } from '../../lib/geo'

/** Same reasoning as SetDeparture.tsx's minutesRemaining: show time
 * actually left on the current meeting point instead of always resetting
 * to a hardcoded default when this screen is reopened. */
function minutesRemaining(time: string): number {
  const ms = new Date(time).getTime() - Date.now()
  const minutes = Math.round(ms / 60_000)
  return Number.isFinite(minutes) ? Math.max(1, minutes) : 1
}

export default function SetMeetingPoint() {
  const { trip, setMeetingPoint } = useTrip()
  const [label, setLabel] = useState(trip.meetingPoint?.label ?? '')
  const [minutes, setMinutes] = useState(
    trip.meetingPoint?.time ? minutesRemaining(trip.meetingPoint.time) : 20,
  )
  const [position, setPosition] = useState<LatLng>(
    trip.meetingPoint ?? { lat: trip.hotel.lat, lng: trip.hotel.lng },
  )
  const navigate = useNavigate()
  const canSave = label.trim().length > 0 && minutes >= 1

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set meeting point" />

      <p style={{ color: 'var(--text-muted)', marginBottom: 18, fontSize: '1.05rem' }}>
        Use this for a regroup that isn't the bus: a fountain, a shop
        entrance, anywhere the group scatters from.
      </p>

      <p style={{ color: 'var(--text-muted)', marginBottom: 10, fontSize: '0.95rem' }}>
        Tap the map or drag the pin to place it exactly.
      </p>
      <LocationPicker value={position} onChange={setPosition} />

      <div className="stack" style={{ marginTop: 18 }}>
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

        <Button
          block
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return
            setMeetingPoint({
              label: label.trim(),
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

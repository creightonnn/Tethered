import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

/** Minutes remaining until the trip's current departureAt, floored at 1
 * (the field's own minimum) so reopening this screen shows how much time
 * is actually left instead of always resetting to a hardcoded default. */
function minutesRemaining(departureAt: string): number {
  const ms = new Date(departureAt).getTime() - Date.now()
  const minutes = Math.round(ms / 60_000)
  return Number.isFinite(minutes) ? Math.max(1, minutes) : 1
}

export default function SetDeparture() {
  const { trip, setDeparture } = useTrip()
  const [label, setLabel] = useState(trip.departureLabel)
  const [minutes, setMinutes] = useState(
    trip.departureAt ? minutesRemaining(trip.departureAt) : 45,
  )
  const navigate = useNavigate()

  const canSave = label.trim().length > 0 && minutes >= 1

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set departure time" />

      <div className="stack">
        <label className="eyebrow" htmlFor="label">
          What travelers see
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
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
            setDeparture(label.trim(), minutes)
            navigate('/app/guide')
          }}
        >
          Save departure time
        </Button>
      </div>
    </div>
  )
}

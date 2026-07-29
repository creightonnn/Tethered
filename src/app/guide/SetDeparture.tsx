import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

export default function SetDeparture() {
  const { trip, setDeparture } = useTrip()
  const [label, setLabel] = useState(trip.departureLabel)
  const [minutes, setMinutes] = useState(45)
  const navigate = useNavigate()

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
          onClick={() => {
            setDeparture(label, minutes)
            navigate('/app/guide')
          }}
        >
          Save departure time
        </Button>
      </div>
    </div>
  )
}

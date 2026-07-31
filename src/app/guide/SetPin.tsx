import { useState } from 'react'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { LocationPicker } from '../components/LocationPicker'
import { useNavigate } from 'react-router-dom'
import type { LatLng } from '../../lib/geo'

export default function SetPin() {
  const { trip, setPin } = useTrip()
  const [note, setNote] = useState(trip.busPin?.note ?? '')
  const [position, setPosition] = useState<LatLng>(
    trip.busPin ?? { lat: trip.hotel.lat, lng: trip.hotel.lng },
  )
  const navigate = useNavigate()

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Set the bus pin" />

      <p style={{ color: 'var(--text-muted)', marginBottom: 18, fontSize: '1.05rem' }}>
        Drop a pin at the bus while you still have a signal. Travelers will be
        able to find their way back to it even after they lose one.
      </p>

      <div className="card" style={{ marginBottom: 18 }}>
        <p className="eyebrow">Current bus pin</p>
        {trip.busPin ? (
          <p style={{ fontSize: '1.05rem' }}>{trip.busPin.note}</p>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No pin set yet.</p>
        )}
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 10, fontSize: '0.95rem' }}>
        Tap the map or drag the pin to place it exactly.
      </p>
      <LocationPicker value={position} onChange={setPosition} />

      <div className="stack" style={{ marginTop: 18 }}>
        <label className="eyebrow" htmlFor="note">
          Note for travelers
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='e.g. "Silver coach, north curb, Bay 4"'
          rows={3}
          style={{
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.05rem',
            padding: 14,
            color: 'var(--text)',
            resize: 'vertical',
          }}
        />

        <Button
          block
          onClick={() => {
            setPin({ lat: position.lat, lng: position.lng, note })
            navigate('/app/guide')
          }}
        >
          Save bus pin
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'

export default function Announce() {
  const { trip, postAnnouncement } = useTrip()
  const [text, setText] = useState('')
  const navigate = useNavigate()

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Post an announcement" />

      {trip.announcement && (
        <div className="card">
          <p className="eyebrow">Currently showing</p>
          <p>{trip.announcement.text}</p>
        </div>
      )}

      <div className="stack" style={{ marginTop: 18 }}>
        <label className="eyebrow" htmlFor="text">
          One thing everyone needs to know
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. Bus is leaving from Bay 6 instead of Bay 4 today."
          style={{
            borderRadius: 16,
            border: '1.5px solid var(--line)',
            background: 'var(--bg-raised)',
            fontSize: '1.1rem',
            padding: 14,
            color: 'var(--text)',
            resize: 'vertical',
          }}
        />

        <Button
          block
          disabled={!text.trim()}
          onClick={() => {
            postAnnouncement(text.trim())
            navigate('/app/guide')
          }}
        >
          Send to everyone
        </Button>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { useTrip } from '../lib/TripProvider'
import { Button } from './components/Button'

export default function Join() {
  const { join, trip } = useTrip()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<'traveler' | 'guide' | null>(
    null,
  )

  function submit(e: FormEvent, role: 'traveler' | 'guide') {
    e.preventDefault()
    setPendingRole(role)
    const ok = join(code, role)
    if (!ok) {
      setError("That code doesn't match. Ask your guide to repeat it.")
      setPendingRole(null)
    }
  }

  return (
    <div className="screen screen--pad-top">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            aria-hidden
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 18px',
              borderRadius: 18,
              background: 'var(--navy-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle
                cx="24"
                cy="24"
                r="16.5"
                stroke="var(--amber-500)"
                strokeWidth="1.6"
                opacity="0.5"
              />
              <circle cx="24" cy="24" r="1.8" fill="var(--amber-500)" />
              <path
                d="M24 24 L32.5 15.5 L27 22.5 Z"
                fill="var(--amber-500)"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
            }}
          >
            Tethered
          </h1>
          <p
            style={{
              marginTop: 8,
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
            }}
          >
            Enter the trip code your guide read out loud.
          </p>
        </div>

        <form className="stack" onSubmit={(e) => submit(e, 'traveler')}>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(null)
            }}
            placeholder="Trip code"
            autoCapitalize="characters"
            autoComplete="off"
            aria-label="Trip code"
            style={{
              minHeight: 64,
              borderRadius: 16,
              border: '1.5px solid var(--line)',
              background: 'var(--bg-raised)',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              letterSpacing: '0.08em',
              color: 'var(--text)',
              padding: '0 16px',
            }}
          />
          {error && (
            <p style={{ color: 'var(--signal-warn)', textAlign: 'center' }}>
              {error}
            </p>
          )}
          <Button type="submit" huge block disabled={pendingRole !== null}>
            Join the trip
          </Button>
          <Button
            type="button"
            variant="secondary"
            block
            onClick={(e) => submit(e as unknown as FormEvent, 'guide')}
          >
            I'm the guide
          </Button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          Demo code: <strong>{trip.code}</strong>
        </p>
      </div>
    </div>
  )
}

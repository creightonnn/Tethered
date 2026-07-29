import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function OfflineBadge() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--navy-900)',
        color: 'var(--paper-100)',
        borderRadius: 999,
        padding: '8px 14px',
        fontSize: '0.85rem',
        fontWeight: 600,
        width: 'fit-content',
        margin: '0 auto 14px',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3l18 18M8.5 8.8A11 11 0 0122 8.6M4.9 11.9A11 11 0 018 10M12 18h.01M9.5 15a5 5 0 015 0"
          stroke="var(--amber-500)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      No signal, still working
    </div>
  )
}

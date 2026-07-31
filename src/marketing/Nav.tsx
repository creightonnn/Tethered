import { Link } from 'react-router-dom'

export function Nav() {
  return (
    <div className="mkt-nav-bar">
      <div className="mkt-nav">
        <div className="mkt-nav__brand">
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="16.5" stroke="var(--amber-500)" strokeWidth="1.6" opacity="0.5" />
            <circle cx="24" cy="24" r="1.8" fill="var(--amber-500)" />
            <path d="M24 24 L32.5 15.5 L27 22.5 Z" fill="var(--amber-500)" />
          </svg>
          Tethered
        </div>
        <div className="mkt-nav__links">
          <Link to="/pricing" className="mkt-nav__link">
            Pricing
          </Link>
          <Link to="/app" className="mkt-nav__cta">
            Try the demo
          </Link>
        </div>
      </div>
    </div>
  )
}

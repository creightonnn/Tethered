import { Link } from 'react-router-dom'

export function FinalCTA() {
  return (
    <section className="final-cta">
      <p className="eyebrow-mkt reveal">Ready when you are</p>
      <h2 className="reveal">Keep your group together on the next one.</h2>
      <div className="final-cta__ctas reveal">
        <Link to="/app" className="mkt-btn mkt-btn--primary">
          Try the live demo
        </Link>
        <a
          href="mailto:hello@tethered.app"
          className="mkt-btn mkt-btn--outline"
        >
          Bring it to your tours
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mkt-footer">
      <p>Tethered. Built for the group that shouldn't have to split up.</p>
    </footer>
  )
}

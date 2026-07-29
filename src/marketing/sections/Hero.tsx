import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="mkt-hero">
      <div>
        <p className="eyebrow-mkt reveal-hero">For guided group tours</p>
        <h1 className="mkt-hero__headline reveal-hero">
          No one gets <em>left behind.</em>
        </h1>
        <p className="mkt-hero__sub reveal-hero">
          Everyone on the trip knows when to be back, where to meet, and how
          to find the group again if they wander off. Your guide gets to
          stop repeating themselves.
        </p>
        <div className="mkt-hero__ctas reveal-hero">
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
        <p className="mkt-hero__offline reveal-hero">
          Built to keep working when the signal doesn't.
        </p>
      </div>

      <div className="board reveal-hero" aria-hidden="true">
        <p className="board__eyebrow">Hokkaido Explorer, Day 6</p>
        <div className="board__row">
          <span className="board__label">Back on the bus</span>
          <span className="board__value">42 min</span>
        </div>
        <div className="board__row">
          <span className="board__label">Roll call</span>
          <span className="board__value">16 / 18</span>
        </div>
        <div className="board__row">
          <span className="board__label">Find the bus</span>
          <span className="board__value">350 m</span>
        </div>
      </div>
    </section>
  )
}

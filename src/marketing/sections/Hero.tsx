import { Link } from 'react-router-dom'
import { ShaderSky } from '../ShaderSky'
import { FlyingPlane } from '../FlyingPlane'

/*
  THESIS: "no one gets left behind" proven through the product's actual
  mechanism — a compass bearing to the bus — not a phone-mockup dashboard
  preview; refuses the generic "app screenshot in a hero card" template.
  OWN-WORLD: a WebGL streak-cloud sky over Tethered's pine-green palette,
  a 3D Boeing 737 flying a path that echoes the shader's own light-streaks,
  Domine headline carrying the product's own confirmed voice line. The
  compass now lives in the Showcase "Find the bus" mockup, where it has
  real product context.
  STORY: a reader sees the world the product operates in before reading a
  word of copy, then scrolls into the real Sapporo story below.
  FIRST VIEWPORT: full-bleed scene fills the hero; headline/sub/CTAs sit
  over it on the left, scrim-protected for contrast.
  FORM: brief-pinned redesign, direct build — extends the compass/
  breadcrumb cross-surface motif already committed in DESIGN.md.
*/

export function Hero() {
  return (
    <section className="mkt-hero">
      <div className="mkt-hero__scene" aria-hidden="true">
        <ShaderSky />
        <FlyingPlane />
      </div>

      <div className="mkt-hero__scrim" aria-hidden="true" />

      <div className="mkt-hero__content">
        <p className="eyebrow-mkt reveal-hero">For guided group tours</p>
        <h1 className="mkt-hero__headline reveal-hero">
          You're not lost.
          <br />
          <em>The bus is this way.</em>
        </h1>
        <p className="mkt-hero__sub reveal-hero">
          Save a pin while you've still got signal. Lose the signal, keep
          the way back. Tethered kept an 18-person tour together across
          Hokkaido — Sapporo malls, a Tokyo airport transfer — with no chat
          thread and no wifi required.
        </p>
        <div className="mkt-hero__ctas reveal-hero">
          <Link to="/app" className="mkt-btn mkt-btn--primary">
            Try the live demo
          </Link>
          <a href="mailto:hello@tethered.app" className="mkt-btn mkt-btn--outline">
            Bring it to your tours
          </a>
        </div>
        <p className="mkt-hero__offline reveal-hero">
          Built to keep working when the signal doesn't.
        </p>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import { ShaderSky } from '../ShaderSky'

/*
  THESIS: "no one gets left behind" proven through the product's actual
  mechanism — a compass bearing to the bus — not a phone-mockup dashboard
  preview; refuses the generic "app screenshot in a hero card" template.
  OWN-WORLD: golden-hour glow over layered topographic ridge silhouettes,
  a full-scale signature compass needle settling toward the bus, a live
  bearing/distance readout in JetBrains Mono, Domine headline carrying the
  product's own confirmed voice line.
  STORY: a reader sees the actual find-the-bus mechanism working before
  reading a word of copy, then scrolls into the real Sapporo story below.
  FIRST VIEWPORT: full-bleed scene fills the hero; headline/sub/CTAs sit
  over it on the left, scrim-protected for contrast.
  FORM: brief-pinned redesign, direct build — extends the compass/
  breadcrumb cross-surface motif already committed in DESIGN.md.
*/

export function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      if (!needleRef.current || prefersReducedMotion()) return
      gsap.fromTo(
        needleRef.current,
        { rotate: -68, transformOrigin: '50% 50%' },
        { rotate: -32, duration: 1.6, ease: 'elastic.out(1, 0.55)', delay: 0.3 },
      )
    },
    { scope: sceneRef },
  )

  return (
    <section className="mkt-hero">
      <div className="mkt-hero__scene" ref={sceneRef} aria-hidden="true">
        <ShaderSky />

        <div className="mkt-hero__compass">
          <div className="mkt-hero__compass-inner">
            <svg width="100%" height="100%" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="86" fill="none" stroke="var(--line)" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="var(--line)" strokeWidth="1" />
              <g ref={needleRef} style={{ transformBox: 'fill-box' }}>
                <path d="M100 26 L112 100 L100 92 L88 100 Z" fill="var(--amber-500)" />
                <path d="M100 174 L92 100 L100 108 L108 100 Z" fill="var(--ink-500)" />
              </g>
              <circle cx="100" cy="100" r="4.5" fill="var(--paper-100)" />
            </svg>
            <div className="mkt-hero__readout">
              <span>BEARING 214°</span>
              <span className="mkt-hero__readout-dot">·</span>
              <span>0.4 MI</span>
              <span className="mkt-hero__readout-dot">·</span>
              <span className="mkt-hero__readout-flag">NO SIGNAL</span>
            </div>
          </div>
        </div>
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

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './sections/FinalCTA'
import './marketing.css'

gsap.registerPlugin(ScrollTrigger)

export default function Pricing() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // This `.reveal` + matchMedia batch is copied from Landing.tsx and
      // shares its known limitation: gsap.matchMedia().add() only invokes
      // its callback when at least one named condition matches, so for a
      // motion-safe user (the common case) this callback never fires at
      // all — `.reveal` content just renders at full opacity immediately
      // instead of animating in. Harmless, but not actually animated.
      // Pre-existing, sitewide, not introduced on this page — see the
      // same note in StoryBeat.tsx for a different component. If
      // Landing.tsx's copy of this ever gets fixed, this one needs the
      // same fix.
      const mm = gsap.matchMedia()

      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { reduce } = context.conditions as { reduce: boolean }

          gsap.set('.reveal', { autoAlpha: 1, y: 0 })

          if (reduce) return

          gsap.set('.reveal', { autoAlpha: 0, y: 34 })
          ScrollTrigger.batch('.reveal', {
            start: 'top 85%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.08,
                overwrite: true,
              }),
          })
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div className="mkt" ref={root} data-theme="marketing">
      <Nav />

      <section className="pricing-hero">
        <div className="mkt-section-head reveal">
          <p className="eyebrow-mkt">Pricing</p>
          <h1 className="pricing-hero__title">One guide. One trip. Everyone stays together.</h1>
          <p className="pricing-hero__sub">
            Simple, per-guide pricing. No accounts for travelers, no setup
            fees, cancel anytime.
          </p>
        </div>
      </section>

      <section className="pricing-tiers">
        <div className="pricing-grid">
          <div className="magic-card pricing-card pricing-card--featured reveal">
            <h2 className="eyebrow-mkt">Pro</h2>
            <p className="pricing-card__price">
              $39<span className="pricing-card__period">/mo per guide</span>
            </p>
            <p className="pricing-card__note">or $390/yr — about 2 months free</p>
            <ul className="pricing-card__features">
              <li>Unlimited trips</li>
              <li>Up to 25 travelers per trip</li>
              <li>Find the bus — offline GPS bearing, distance, and breadcrumb trail</li>
              <li>Roll call with live headcount</li>
              <li>Today / day-pack: departure countdown, hotel and airport cards</li>
              <li>Guide-to-group announcements</li>
            </ul>
            <Link to="/app" className="mkt-btn mkt-btn--primary">
              Try the live demo
            </Link>
          </div>

          <div className="magic-card pricing-card reveal">
            <h2 className="eyebrow-mkt">Operator</h2>
            <p className="pricing-card__price">Contact us</p>
            <p className="pricing-card__note">
              For tour companies running more than one guide. Tell us how
              your operation works and we'll scope it with you.
            </p>
            <p className="pricing-card__note pricing-card__note--label">
              What we'd build for you:
            </p>
            <ul className="pricing-card__features">
              <li>Everything in Pro</li>
              <li>Coordinating guides across your team</li>
              <li>Multiple trips running at once</li>
              <li>Custom branding</li>
              <li>Priority support</li>
            </ul>
            <a href="mailto:hello@tethered.app" className="mkt-btn mkt-btn--outline">
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <section className="pricing-faq">
        <div className="mkt-section-head reveal">
          <p className="eyebrow-mkt">Questions</p>
          <h2>Before you ask</h2>
        </div>
        <div className="pricing-faq__list">
          <div className="pricing-faq__item reveal">
            <h3>How does billing work?</h3>
            <p>
              Pro is billed monthly or yearly, per guide. Cancel anytime —
              you keep access through the end of your current billing
              period.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>Does offline capability change by plan?</h3>
            <p>
              No. Find the bus, roll call, and the day-pack work fully
              offline on every plan — that's the whole point of the
              product, not a feature we'd gate.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>What counts as a trip?</h3>
            <p>
              One trip code, one group, start to finish — a single
              multi-day tour, however many stops it has.
            </p>
          </div>
          <div className="pricing-faq__item reveal">
            <h3>Do travelers need to pay or sign up?</h3>
            <p>
              No. Travelers join with a code the guide reads out loud — no
              account, no download beyond installing the app to their
              home screen if they want to.
            </p>
          </div>
        </div>
      </section>

      <section className="pricing-trust">
        <p className="trust-line reveal">
          Tested on a real 11-day Hokkaido tour. Eighteen travelers, two
          guides, seven hotels, one Sapporo afternoon that made the case for
          this.
        </p>
      </section>

      <Footer />
    </div>
  )
}

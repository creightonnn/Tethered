import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

function PhoneFrame({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="phone">
      <p className="phone__label">{label}</p>
      {children}
    </div>
  )
}

function MockHome() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          background: 'var(--amber-100)',
          borderRadius: 12,
          padding: '10px 12px',
          fontSize: '0.72rem',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Meeting at the fountain by Bay 4 if you get turned around.
      </div>
      <div style={{ textAlign: 'center', margin: '18px 0 22px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-700)', fontWeight: 600 }}>
          Back on the bus
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2.6rem',
            fontWeight: 700,
            color: 'var(--ink-900)',
          }}
        >
          42 min
        </p>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            background: 'var(--amber-600)',
            color: 'white',
            borderRadius: 16,
            padding: '18px 0',
            textAlign: 'center',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
          }}
        >
          Find the bus
        </div>
      </div>
    </div>
  )
}

function MockFindBus() {
  const compassRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      if (!needleRef.current || prefersReducedMotion()) return
      gsap.fromTo(
        needleRef.current,
        { rotate: -68, transformOrigin: '50% 50%' },
        {
          rotate: -32,
          duration: 1.6,
          ease: 'elastic.out(1, 0.55)',
          delay: 0.3,
          scrollTrigger: {
            trigger: compassRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    { scope: compassRef },
  )

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="showcase-compass" ref={compassRef}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" fill="none" stroke="var(--paper-300)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="var(--paper-300)" strokeWidth="1" />
          <g ref={needleRef} style={{ transformBox: 'fill-box' }}>
            <path d="M100 26 L112 100 L100 92 L88 100 Z" fill="var(--amber-600)" />
            <path d="M100 174 L92 100 L100 108 L108 100 Z" fill="var(--ink-700)" />
          </g>
          <circle cx="100" cy="100" r="4.5" fill="var(--paper-50)" />
        </svg>
        <div className="showcase-compass__readout">
          <span>BEARING 214°</span>
          <span className="showcase-compass__readout-dot">·</span>
          <span>0.4 MI</span>
          <span className="showcase-compass__readout-dot">·</span>
          <span className="showcase-compass__readout-flag">NO SIGNAL</span>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', textAlign: 'center', marginTop: 14 }}>
        About a 4-minute walk. Head this way.
      </p>
    </div>
  )
}

function MockRollCall() {
  const names = ['Carol M.', 'Gene M.', 'Diane K.', 'Roger K.']
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '1.8rem',
            color: 'var(--ink-900)',
          }}
        >
          16 of 18 here
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {names.map((n, i) => (
          <div
            key={n}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              padding: '6px 0',
              borderBottom: '1px solid var(--paper-300)',
            }}
          >
            <span>{n}</span>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: i === 3 ? 'var(--warning)' : 'var(--success)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Showcase() {
  return (
    <section id="showcase">
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">Inside the app</p>
        <h2>Built for one thumb, in bright sun, with no time to think.</h2>
      </div>

      <div className="showcase">
        <div className="showcase-row">
          <div className="showcase-phone reveal">
            <PhoneFrame label="Home">
              <MockHome />
            </PhoneFrame>
          </div>
          <div className="showcase-copy reveal">
            <span className="eyebrow-mkt">Home</span>
            <h3>One glance answers the only two questions that matter.</h3>
            <p>
              When to be back, and what your guide just said. Nothing else
              competes for attention, and the one button that matters most
              is always right there.
            </p>
          </div>
        </div>

        <div className="showcase-row showcase-row--reverse">
          <div className="showcase-phone reveal">
            <PhoneFrame label="Find the bus">
              <MockFindBus />
            </PhoneFrame>
          </div>
          <div className="showcase-copy reveal">
            <span className="eyebrow-mkt">Find the bus</span>
            <h3>An arrow, a distance, and a plain instruction.</h3>
            <p>
              The pin gets dropped while you still have a signal. From
              there, it's just GPS and a compass: no map tiles, no
              connection required, no reason it should ever fail you.
            </p>
          </div>
        </div>

        <div className="showcase-row">
          <div className="showcase-phone reveal">
            <PhoneFrame label="Roll call">
              <MockRollCall />
            </PhoneFrame>
          </div>
          <div className="showcase-copy reveal">
            <span className="eyebrow-mkt">Roll call</span>
            <h3>Your guide taps start. Everyone else taps one button.</h3>
            <p>
              The count fills in as people check in, and the names still
              missing stay right on screen, so nobody's holding up a bus
              full of people wondering who they're waiting for.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

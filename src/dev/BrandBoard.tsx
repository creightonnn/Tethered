import '../app/app.css'
import './brand-board.css'

const inkScale = [
  ['950', '#0e1712'],
  ['900', '#16211c'],
  ['800', '#1e2c25'],
  ['700', '#2b3b32'],
  ['600', '#3d4f44'],
  ['500', '#576c5f'],
  ['300', '#a9b8ac'],
] as const

const paperScale = [
  ['50', '#fbf8f2'],
  ['100', '#f6f1e7'],
  ['200', '#ede4d2'],
  ['300', '#e2d5bc'],
  ['400', '#c9b896'],
] as const

const greenScale = [
  ['900', '#0f3324'],
  ['800', '#14432e'],
  ['700', '#195a3d'],
  ['600', '#1f6b4a'],
  ['500', '#2c8560'],
  ['400', '#4ca37d'],
  ['300', '#7fc2a3'],
  ['200', '#b5e0cb'],
  ['100', '#e1f3e9'],
] as const

const amberScale = [
  ['900', '#7a4e11'],
  ['800', '#9c6818'],
  ['700', '#c08420'],
  ['600', '#e8a13a'],
  ['500', '#f0b155'],
  ['400', '#f5c57e'],
  ['300', '#f9dbac'],
  ['200', '#fcebd1'],
  ['100', '#fef6e8'],
] as const

const tealScale = [
  ['900', '#123b42'],
  ['800', '#185561'],
  ['700', '#1f7683'],
  ['600', '#2baebf'],
  ['500', '#45c2d2'],
  ['300', '#a6e3eb'],
  ['200', '#d2f1f5'],
] as const

const semanticScale = [
  ['success (guide)', '#4ca37d'],
  ['success (traveler)', '#195a3d'],
  ['warning (guide)', '#d97a34'],
  ['warning (traveler)', '#a65420'],
  ['danger (guide)', '#c24a3b'],
  ['danger (traveler)', '#963527'],
] as const

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="swatch">
      <div className="swatch__chip" style={{ background: hex }} />
      <div className="swatch__label">{name}</div>
      <div className="swatch__hex">{hex}</div>
    </div>
  )
}

function Ramp({ title, scale }: { title: string; scale: readonly (readonly [string, string])[] }) {
  return (
    <div className="ramp">
      <h3 className="ramp__title">{title}</h3>
      <div className="ramp__row">
        {scale.map(([name, hex]) => (
          <Swatch key={name} name={name} hex={hex} />
        ))}
      </div>
    </div>
  )
}

function TypeScale() {
  return (
    <div className="type-scale">
      <p className="type-scale__sample" style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
        You're not lost.
      </p>
      <p className="type-scale__sample" style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)' }}>
        The bus is this way.
      </p>
      <p className="type-scale__badge" style={{ fontFamily: 'Bevan' }}>
        YOU ARE HERE
      </p>
      <p className="type-scale__sample" style={{ fontFamily: 'Public Sans', fontWeight: 600, fontSize: '1.25rem' }}>
        You've got 40 minutes. Plenty of time.
      </p>
      <p className="type-scale__sample" style={{ fontFamily: 'Public Sans', fontWeight: 400, fontSize: '1.125rem' }}>
        Public Sans body copy, set at the 18px accessibility floor — legible
        for a stressed traveler without reading glasses.
      </p>
      <p className="type-scale__mono" style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
        16/18 · 0.4mi · 07:32
      </p>
    </div>
  )
}

function ButtonStates({ label }: { label: string }) {
  return (
    <div className="btn-states">
      <h3 className="ramp__title">Button states — {label}</h3>
      <div className="btn-states__row">
        <button className="btn btn--primary">Find the bus</button>
        <button className="btn btn--primary" data-state="hover">
          Hover
        </button>
        <button className="btn btn--primary" data-state="press">
          Press
        </button>
        <button className="btn btn--primary" disabled>
          Disabled
        </button>
      </div>
      <div className="btn-states__row">
        <button className="btn btn--secondary">Set meeting point</button>
        <button className="btn btn--ghost">Cancel</button>
      </div>
    </div>
  )
}

function ThemePanel({ theme, label }: { theme: 'guide' | 'traveler'; label: string }) {
  return (
    <section className="theme-panel" data-theme={theme}>
      <header className="theme-panel__head">
        <span className="theme-panel__eyebrow" style={{ fontFamily: 'Bevan' }}>
          {theme === 'guide' ? 'Instrument panel' : 'Field guide'}
        </span>
        <h2 style={{ fontFamily: 'Fraunces' }}>{label}</h2>
      </header>
      <TypeScale />
      <ButtonStates label={label} />
      <div className="card-sample">
        <div className="card">
          <div className="eyebrow" style={{ fontFamily: 'Bevan' }}>
            Next departure
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '2.4rem' }}>
            00:38:12
          </div>
        </div>
      </div>
    </section>
  )
}

export default function BrandBoard() {
  return (
    <div className="brand-board">
      <header className="brand-board__intro">
        <span className="brand-board__eyebrow" style={{ fontFamily: 'Bevan' }}>
          Tethered · Design system
        </span>
        <h1 style={{ fontFamily: 'Fraunces' }}>Expedition Field Guide</h1>
        <p>
          One brand, two temperatures: the guide's dark instrument panel and
          the traveler's calm paper field guide. Same palette, same type,
          opposite surface.
        </p>
      </header>

      <Ramp title="Ink" scale={inkScale} />
      <Ramp title="Paper" scale={paperScale} />
      <Ramp title="Expedition Green — primary" scale={greenScale} />
      <Ramp title="Trailmarker Amber — signature" scale={amberScale} />
      <Ramp title="Lake Teal — wayfinding" scale={tealScale} />
      <Ramp title="Semantic (warm-tuned)" scale={semanticScale} />

      <div className="theme-panels">
        <ThemePanel theme="guide" label="Guide — dark cockpit" />
        <ThemePanel theme="traveler" label="Traveler — light paper" />
      </div>
    </div>
  )
}

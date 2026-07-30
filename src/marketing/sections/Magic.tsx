const ICONS = {
  rollcall: 'M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3',
  megaphone: 'M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM17 8a3 3 0 010 8',
}

function MagicIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Magic() {
  return (
    <section id="magic">
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually helps</p>
        <h2>The parts a group chat can't do.</h2>
      </div>

      <div className="magic-grid">
        <div className="magic-card reveal">
          <div className="magic-card__icon">
            <MagicIcon name="rollcall" />
          </div>
          <h3>A headcount, not a guessing game</h3>
          <p>
            One tap and everyone's marked here. Your guide sees the count
            fill in live, and exactly who's still missing, instead of
            scanning faces on a curb.
          </p>
        </div>
        <div className="magic-card reveal">
          <div className="magic-card__icon">
            <MagicIcon name="clock" />
          </div>
          <h3>One countdown everyone can see</h3>
          <p>
            The time to be back on the bus lives on every phone in the
            group, tied to the actual plan for the day, not buried in a
            message someone sent an hour ago.
          </p>
        </div>
        <div className="magic-card reveal">
          <div className="magic-card__icon">
            <MagicIcon name="megaphone" />
          </div>
          <h3>The one thing that matters, not forty replies</h3>
          <p>
            When your guide changes the pickup bay, everyone sees it at
            the top of their screen. No scrolling back through a chat to
            find the message that actually counts.
          </p>
        </div>
      </div>

      <div className="magic-honest reveal">
        <span>
          <strong>And it keeps working when the signal doesn't.</strong>{' '}
          Find the Bus runs on GPS alone, so it still works in the mall,
          the subway, the airport, wherever your phone loses its bars.
        </span>
      </div>
    </section>
  )
}

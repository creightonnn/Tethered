export function Problem() {
  return (
    <section id="story">
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually happened</p>
        <h2>It worked, until the group split up.</h2>
      </div>

      <div className="story">
        <div className="story__beat reveal">
          <span className="story__mark">Hokkaido, day 6</span>
          <p className="story__text">
            Eighteen travelers, two guides, eleven days, seven hotels.
            On-bus coordination was a whiteboard with the return time,
            plus a group chat. It worked, until the group split up.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Sapporo, free-wander</span>
          <p className="story__text">
            The moment anyone stepped off the bus and into a mall or a
            restaurant, their phone lost signal. Every tool built to help,
            the group chat, the live location sharing, went dark right
            when it was needed most.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Half the group, 30 minutes apart</span>
          <p className="story__text">
            Some travelers stayed near the hotel. Others walked half an
            hour to a shopping center. When someone got turned around
            inside the mall, there was no easy way to find the rest of
            the group.
          </p>
        </div>

        <div className="story__beat reveal">
          <span className="story__mark">Hokkaido → Tokyo → Honolulu</span>
          <p className="story__text">
            Three flights home, and the same questions on repeat: what
            terminal, which gate. One traveler took the escalator instead
            of the elevator and got separated from everyone else.
          </p>
        </div>
      </div>

      <p className="story__quote reveal">
        "I wish I could save a waypoint while I still had internet on the
        bus, so I'd know where I went and how to get back with no
        connection."
        <br />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          (a traveler on that trip)
        </span>
      </p>
    </section>
  )
}

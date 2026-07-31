import { StoryBeat } from './StoryBeat'

export function Problem() {
  return (
    <section id="story">
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually happened</p>
        <h2>It worked, until the group split up.</h2>
      </div>

      <StoryBeat
        mark="Hokkaido, day 6"
        text="Eighteen travelers, two guides, eleven days, seven hotels. On-bus coordination was a whiteboard with the return time, plus a group chat. It worked, until the group split up."
        imageUrl="https://images.unsplash.com/photo-1576829021150-ebc8b46b9fb9?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Snow-covered mountain landscape in Hokkaido, Japan"
        align="left"
      />

      <StoryBeat
        mark="Sapporo, free-wander"
        text="The moment anyone stepped off the bus and into a mall or a restaurant, their phone lost signal. Every tool built to help, the group chat, the live location sharing, went dark right when it was needed most."
        imageUrl="https://images.unsplash.com/photo-1736519464863-cf84f243dd08?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Snowy city street in Sapporo, Japan"
        align="right"
      />

      <StoryBeat
        mark="Half the group, 30 minutes apart"
        text="Some travelers stayed near the hotel. Others walked half an hour to a shopping center. When someone got turned around inside the mall, there was no easy way to find the rest of the group."
        imageUrl="https://images.unsplash.com/photo-1761442664224-bcc947600fe1?w=1200&auto=format&fit=crop&q=60"
        imageAlt="People walking through an outdoor shopping center"
        align="left"
      />

      <StoryBeat
        mark="Hokkaido → Tokyo → Honolulu"
        text="Three flights home, and the same questions on repeat: what terminal, which gate. One traveler took the escalator instead of the elevator and got separated from everyone else."
        imageUrl="https://images.unsplash.com/photo-1642035148715-7cc0c7538904?w=1200&auto=format&fit=crop&q=60"
        imageAlt="Airport terminal with a departure times sign"
        align="right"
      />

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

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const stage = stageRef.current
      if (!stage) return

      const mm = gsap.matchMedia()

      mm.add(
        { desktop: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean
            reduce: boolean
          }
          if (!desktop || reduce) return

          const beats = gsap.utils.toArray<HTMLElement>('.story__beat', stage)
          const dots = gsap.utils.toArray<HTMLElement>('.story__progress-dot', stage)
          const marks = beats.map(
            (beat) => beat.querySelector<HTMLElement>('.story__mark')!,
          )

          stage.classList.add('story--pinned')

          gsap.set(beats, { opacity: 0.15, scale: 0.96 })
          gsap.set(beats[0], { opacity: 1, scale: 1 })
          gsap.set(dots, { backgroundColor: 'var(--line)' })
          gsap.set(dots[0], { backgroundColor: 'var(--accent)' })
          gsap.set(marks, { color: 'var(--text-muted)' })
          gsap.set(marks[0], { color: 'var(--accent)' })

          // The site nav is `position: sticky; top: 0` and sits above the
          // pinned stage in z-index, so anchoring the pin at the bare
          // viewport top ('top top') tucks the stage's top edge under the
          // nav for the whole pinned range. Offset the start point by the
          // nav's rendered height so the pinned stage sits just below it.
          const navBar = document.querySelector<HTMLElement>('.mkt-nav-bar')
          const navOffset = navBar ? navBar.getBoundingClientRect().height : 0

          const OVERLAP = 0.3
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: `top top+=${navOffset}`,
              end: '+=250%',
              pin: true,
              scrub: 1,
            },
          })

          beats.forEach((beat, i) => {
            if (i === 0) return
            const at = i - OVERLAP
            const dur = OVERLAP * 2
            tl.to(beats[i - 1], { opacity: 0.15, scale: 0.96, duration: dur }, at)
            tl.to(beat, { opacity: 1, scale: 1, duration: dur }, at)
            tl.to(marks[i - 1], { color: 'var(--text-muted)', duration: dur }, at)
            tl.to(marks[i], { color: 'var(--accent)', duration: dur }, at)
            tl.to(dots[i - 1], { backgroundColor: 'var(--line)', duration: dur }, at)
            tl.to(dots[i], { backgroundColor: 'var(--accent)', duration: dur }, at)
          })

          // Without this, the last beat's transition ends exactly when the
          // timeline (and therefore the pin) does, so it never gets a
          // moment to rest before the pin releases into the quote below —
          // the quote's fade-in visually collides with beat 4 still mid-
          // crossfade. This trailing no-op tween buys beat 4 idle/settled
          // time before release, independent of stage height, pin
          // distance, or OVERLAP (none of which can create that gap).
          tl.to({}, { duration: 0.7 })

          return () => {
            stage.classList.remove('story--pinned')
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section id="story" ref={sectionRef}>
      <div className="mkt-section-head reveal">
        <p className="eyebrow-mkt">What actually happened</p>
        <h2>It worked, until the group split up.</h2>
      </div>

      <div className="story" ref={stageRef}>
        <div className="story__progress">
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
          <span className="story__progress-dot" />
        </div>

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

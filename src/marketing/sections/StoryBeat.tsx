import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface StoryBeatProps {
  mark: string
  text: string
  imageUrl: string
  imageAlt: string
  align: 'left' | 'right'
}

export function StoryBeat({ mark, text, imageUrl, imageAlt, align }: StoryBeatProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const image = imageRef.current
      const content = contentRef.current
      if (!wrapper || !image || !content) return

      const mm = gsap.matchMedia()

      mm.add(
        { desktop: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean
            reduce: boolean
          }
          if (!desktop || reduce) return

          wrapper.classList.add('story-beat--motion')

          gsap.set(content, { opacity: 0, y: 24 })

          // One-shot entrance fade for the text, independent of the
          // image's continuous scrub below. Deliberately NOT using the
          // sitewide `.reveal` + Landing.tsx's shared ScrollTrigger.batch:
          // that batch never actually fires for motion-safe users (a
          // separate, pre-existing bug), so relying on it here would mean
          // this text never animates in for the audience this feature
          // targets.
          ScrollTrigger.create({
            trigger: content,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(content, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
            },
          })

          // Continuous scale tied to the photo's actual sticky "dwell"
          // window, not the wrapper's full transit through the viewport.
          // 'top top' -> 'bottom bottom' are ScrollTrigger's built-in
          // relative keywords (the wrapper's top hitting the viewport's
          // top, through the wrapper's bottom hitting the viewport's
          // bottom) — this matches the span during which the image is
          // actually pinned/visible via `position: sticky`, so the full
          // 1.0 -> 1.08 scale plays out across the time the viewer can
          // see it stuck, instead of mostly happening off-screen before
          // it sticks or after it releases. Still no fixed px or vh
          // value is needed here, so this can't fall out of sync with
          // viewport height the way the previous design's fixed stage
          // height did.
          gsap.fromTo(
            image,
            { scale: 1 },
            {
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            },
          )

          return () => {
            wrapper.classList.remove('story-beat--motion')
          }
        },
      )

      return () => mm.revert()
    },
    { scope: wrapperRef },
  )

  return (
    <div
      className={`story-beat${align === 'right' ? ' story-beat--reverse' : ''}`}
      ref={wrapperRef}
    >
      <div className="story-beat__image-col">
        <div className="story-beat__image-frame">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="story-beat__image"
            ref={imageRef}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="story-beat__content" ref={contentRef}>
        <span className="story__mark">{mark}</span>
        <p className="story__text">{text}</p>
      </div>
    </div>
  )
}

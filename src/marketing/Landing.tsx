import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Nav } from './Nav'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { Magic } from './sections/Magic'
import { Showcase } from './sections/Showcase'
import { Audience } from './sections/Audience'
import { FinalCTA, Footer } from './sections/FinalCTA'
import './marketing.css'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { reduce } = context.conditions as { reduce: boolean }

          gsap.set('.reveal, .reveal-hero', { autoAlpha: 1, y: 0 })

          if (reduce) return

          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          heroTl
            .fromTo(
              '.reveal-hero',
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 },
            )
            .fromTo(
              '.mkt-hero__scene',
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 1.1 },
              0.1,
            )

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

          gsap.to('.mkt-hero__compass-inner', {
            y: -70,
            rotate: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: '.mkt-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
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
      <Hero />
      <Problem />
      <Magic />
      <Showcase />
      <Audience />
      <FinalCTA />
      <Footer />
    </div>
  )
}

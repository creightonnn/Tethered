import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedMarqueeHeroProps {
  tagline: string
  title: React.ReactNode
  description: string
  ctaText: string
  images: string[]
  onCtaClick?: () => void
  className?: string
}

const ActionButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-6 md:mt-8 px-8 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-lg transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/75"
  >
    {children}
  </motion.button>
)

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  onCtaClick,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()

  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20
      }
    },
  }

  // When the user prefers reduced motion, start every entrance animation in
  // its final ("show") state instead of animating from "hidden" — this
  // makes the initial/animate transition a no-op regardless of each
  // element's own transition/delay overrides.
  const initialAnimationState = prefersReducedMotion ? 'show' : 'hidden'

  const duplicatedImages = [...images, ...images]

  return (
    <section
      className={cn(
        'relative w-full min-h-screen overflow-hidden bg-background flex flex-col items-center pt-24 pb-10 md:pt-28 md:pb-14',
        className,
      )}
    >
      <div className="z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={initialAnimationState}
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-3 md:mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial={initialAnimationState}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="mkt-hero-marquee__title text-4xl md:text-7xl font-bold text-foreground"
        >
          {typeof title === 'string'
            ? title.split(' ').map((word, i) => (
                <motion.span key={i} variants={FADE_IN_ANIMATION_VARIANTS} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        <motion.p
          initial={initialAnimationState}
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mkt-hero-marquee__description max-w-xl text-base md:text-lg text-muted-foreground"
        >
          {description}
        </motion.p>

        <motion.div
          initial={initialAnimationState}
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 mt-6 md:mt-10 w-full h-40 shrink-0 overflow-hidden md:h-64 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
      >
        <motion.div
          className="flex w-max gap-4"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: ['0%', '-50%'],
                  transition: {
                    ease: 'linear',
                    duration: 40,
                    repeat: Infinity,
                  },
                }
          }
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-40 md:h-64 shrink-0"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 5}deg`,
              }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

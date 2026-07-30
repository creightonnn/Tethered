import { useNavigate } from 'react-router-dom'
import { AnimatedMarqueeHero } from '@/components/ui/hero-3'

const TOUR_IMAGES = [
  'https://images.unsplash.com/photo-1757983160551-5486507ee797?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1639438415473-a3c25d94cfe1?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1752563247435-8b1ee6107121?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1545972154-9bb223aac798?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1608221621423-8112b3fb7435?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1699341606473-3038483f93c1?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1736156725121-027231636f9d?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1756753103801-76980a5b5979?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1752807604225-ba452b60469f?w=900&auto=format&fit=crop&q=60',
]

export function Hero() {
  const navigate = useNavigate()

  return (
    <AnimatedMarqueeHero
      className="mkt-hero-marquee"
      tagline="For guided group tours"
      title={
        <>
          You're not lost.
          <br />
          <em className="not-italic text-[var(--accent)]">The bus is this way.</em>
        </>
      }
      description="Save a pin while you've still got signal. Lose the signal, keep the way back. Tethered kept an 18-person tour together across Hokkaido — Sapporo malls, a Tokyo airport transfer — with no chat thread and no wifi required. Built to keep working when the signal doesn't."
      ctaText="Try the live demo"
      onCtaClick={() => navigate('/app')}
      images={TOUR_IMAGES}
    />
  )
}

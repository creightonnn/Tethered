import { useEffect, useState } from 'react'

type OrientationEventWithWebkit = DeviceOrientationEvent & {
  webkitCompassHeading?: number
}

/**
 * Device compass heading in degrees (0 = device pointing north), or null
 * when unavailable/unpermitted. Works with no network — it's a sensor read.
 */
export function useCompassHeading(enabled: boolean): number | null {
  const [heading, setHeading] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handle = (event: Event) => {
      const e = event as OrientationEventWithWebkit
      if (typeof e.webkitCompassHeading === 'number') {
        setHeading(e.webkitCompassHeading)
      } else if (e.alpha !== null && e.alpha !== undefined) {
        setHeading(360 - e.alpha)
      }
    }

    window.addEventListener('deviceorientationabsolute', handle, true)
    window.addEventListener('deviceorientation', handle, true)

    return () => {
      window.removeEventListener('deviceorientationabsolute', handle, true)
      window.removeEventListener('deviceorientation', handle, true)
    }
  }, [enabled])

  return heading
}

/** iOS requires an explicit user gesture to grant motion/orientation access. */
export async function requestCompassPermission(): Promise<boolean> {
  const anyOrientation = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  if (typeof anyOrientation.requestPermission === 'function') {
    try {
      const result = await anyOrientation.requestPermission()
      return result === 'granted'
    } catch {
      return false
    }
  }
  return true
}

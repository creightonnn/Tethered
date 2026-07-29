import { useEffect, useRef, useState } from 'react'
import type { LatLng } from './geo'

interface GeoState {
  position: LatLng | null
  accuracy: number | null
  error: string | null
  supported: boolean
}

/**
 * Watches the device's real GPS position. Geolocation is a passive, local
 * capability of the phone — it keeps working with no signal, which is what
 * lets Find the Bus function with the network fully off.
 */
export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({
    position: null,
    accuracy: null,
    error: null,
    supported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  })
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !state.supported) return

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
          error: null,
        }))
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message }))
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    )

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, state.supported])

  return state
}

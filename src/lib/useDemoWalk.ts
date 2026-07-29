import { useEffect, useRef, useState } from 'react'
import type { LatLng } from './geo'

const METERS_PER_TICK = 3.2
const TICK_MS = 550
const METERS_PER_DEGREE_LAT = 111_320

function offsetMeters(origin: LatLng, north: number, east: number): LatLng {
  const lat = origin.lat + north / METERS_PER_DEGREE_LAT
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((origin.lat * Math.PI) / 180)
  const lng = origin.lng + east / metersPerDegreeLng
  return { lat, lng }
}

/**
 * Demo/simulation mode: fakes "walking away from the bus" so Find the Bus
 * can be pitched indoors, without a real GPS walk. Real GPS (useGeolocation)
 * is used whenever simulation is off.
 */
export function useDemoWalk(pin: LatLng | null) {
  const [active, setActive] = useState(false)
  const [offset, setOffset] = useState({ north: 0, east: 0 })
  const headingRef = useRef(35 + Math.random() * 40)
  const directionRef = useRef<1 | -1>(1)

  useEffect(() => {
    if (!active || !pin) return
    const id = window.setInterval(() => {
      headingRef.current += (Math.random() - 0.5) * 14
      const rad = (headingRef.current * Math.PI) / 180
      setOffset((o) => ({
        north:
          o.north + Math.cos(rad) * METERS_PER_TICK * directionRef.current,
        east: o.east + Math.sin(rad) * METERS_PER_TICK * directionRef.current,
      }))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [active, pin])

  const position = pin ? offsetMeters(pin, offset.north, offset.east) : null
  const distanceFromPin = Math.sqrt(offset.north ** 2 + offset.east ** 2)

  return {
    active,
    position,
    distanceFromPin,
    startWalking: () => {
      directionRef.current = 1
      setActive(true)
    },
    retraceSteps: () => {
      directionRef.current = -1
      setActive(true)
    },
    stop: () => setActive(false),
    reset: () => {
      setActive(false)
      setOffset({ north: 0, east: 0 })
    },
  }
}

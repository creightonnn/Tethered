export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6_371_000
const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Great-circle distance in meters. Works fully offline — no map tiles or network involved. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

/** Compass bearing in degrees (0 = north, 90 = east) from `a` toward `b`. */
export function bearingDegrees(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

const COMPASS_POINTS = [
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
]

export function compassLabel(bearing: number): string {
  const index = Math.round(bearing / 45) % 8
  return COMPASS_POINTS[index]
}

export function formatDistance(meters: number): string {
  if (meters < 30) return 'right here'
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** Rough walking estimate at ~4.5 km/h, rounded up to the next minute. */
export function walkingMinutes(meters: number): number {
  const minutes = meters / 75
  return Math.max(1, Math.ceil(minutes))
}

export function walkingLabel(meters: number): string {
  if (meters < 30) return "You're basically there. Head this way."
  const mins = walkingMinutes(meters)
  const guess = mins === 1 ? 'About a minute' : `About a ${mins}-minute`
  return `${guess} walk. Head this way.`
}

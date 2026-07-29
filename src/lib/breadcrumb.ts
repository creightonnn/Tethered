import { distanceMeters, type LatLng } from './geo'

export interface BreadcrumbPoint extends LatLng {
  t: number
}

const KEY = 'tethered.breadcrumb'
const MIN_DROP_DISTANCE_M = 12

function read(): BreadcrumbPoint[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BreadcrumbPoint[]) : []
  } catch {
    return []
  }
}

function write(points: BreadcrumbPoint[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(points))
  } catch {
    // storage unavailable — trail simply won't persist across reloads
  }
}

export function getTrail(): BreadcrumbPoint[] {
  return read()
}

/** Appends a point only once the traveler has moved meaningfully, so the trail stays useful and small. */
export function dropCrumb(point: LatLng): BreadcrumbPoint[] {
  const trail = read()
  const last = trail[trail.length - 1]
  if (last && distanceMeters(last, point) < MIN_DROP_DISTANCE_M) {
    return trail
  }
  const next = [...trail, { ...point, t: Date.now() }]
  write(next)
  return next
}

export function clearTrail() {
  write([])
}

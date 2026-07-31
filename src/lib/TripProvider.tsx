import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Pin, Trip } from './tripTypes'
import { createSeedTrip } from './seedTrip'

const TRIP_KEY = 'tethered.trip'
const ROLE_KEY = 'tethered.role'

export type Role = 'traveler' | 'guide' | null

function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(TRIP_KEY)
    if (raw) return JSON.parse(raw) as Trip
  } catch {
    // fall through to seed
  }
  const seeded = createSeedTrip()
  localStorage.setItem(TRIP_KEY, JSON.stringify(seeded))
  return seeded
}

function loadRole(): Role {
  const raw = localStorage.getItem(ROLE_KEY)
  return raw === 'traveler' || raw === 'guide' ? raw : null
}

interface TripContextValue {
  trip: Trip
  role: Role
  join: (code: string, role: 'traveler' | 'guide') => boolean
  leave: () => void
  switchRole: (role: 'traveler' | 'guide') => void
  setPin: (pin: Pin) => void
  setDeparture: (label: string, minutesFromNow: number) => void
  setMeetingPoint: (
    point: { label: string; time: string; lat: number; lng: number } | null,
  ) => void
  postAnnouncement: (text: string) => void
  startRollCall: () => void
  endRollCall: () => void
  checkIn: (id: string) => void
  toggleCheckIn: (id: string) => void
  simulateCheckIns: () => void
  resetDemo: () => void
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip>(loadTrip)
  const [role, setRole] = useState<Role>(loadRole)

  useEffect(() => {
    localStorage.setItem(TRIP_KEY, JSON.stringify(trip))
  }, [trip])

  useEffect(() => {
    if (role) localStorage.setItem(ROLE_KEY, role)
    else localStorage.removeItem(ROLE_KEY)
  }, [role])

  const join = useCallback(
    (code: string, nextRole: 'traveler' | 'guide') => {
      if (code.trim().toUpperCase() !== trip.code) return false
      setRole(nextRole)
      return true
    },
    [trip.code],
  )

  const leave = useCallback(() => setRole(null), [])

  const switchRole = useCallback((nextRole: 'traveler' | 'guide') => {
    setRole(nextRole)
  }, [])

  const setPin = useCallback(
    (pin: Pin) => setTrip((t) => ({ ...t, busPin: pin })),
    [],
  )

  const setDeparture = useCallback(
    (label: string, minutesFromNow: number) =>
      setTrip((t) => ({
        ...t,
        departureLabel: label,
        departureAt: new Date(Date.now() + minutesFromNow * 60_000).toISOString(),
      })),
    [],
  )

  const setMeetingPoint: TripContextValue['setMeetingPoint'] = useCallback(
    (point) => setTrip((t) => ({ ...t, meetingPoint: point })),
    [],
  )

  const postAnnouncement = useCallback(
    (text: string) =>
      setTrip((t) => ({
        ...t,
        announcement: { text, postedAt: new Date().toISOString() },
      })),
    [],
  )

  const startRollCall = useCallback(
    () =>
      setTrip((t) => ({
        ...t,
        rollCallActive: true,
        rollCallStartedAt: new Date().toISOString(),
        roster: t.roster.map((m) => ({ ...m, checkedIn: false })),
      })),
    [],
  )

  const endRollCall = useCallback(
    () => setTrip((t) => ({ ...t, rollCallActive: false })),
    [],
  )

  const checkIn = useCallback(
    (id: string) =>
      setTrip((t) => ({
        ...t,
        roster: t.roster.map((m) =>
          m.id === id ? { ...m, checkedIn: true } : m,
        ),
      })),
    [],
  )

  /** Guide-only manual override: unlike checkIn (one-way, used by a
   * traveler's own "I'm here" tap), this toggles — so a guide who taps the
   * wrong name in the roster can immediately correct the mistake without
   * restarting the whole roll call. */
  const toggleCheckIn = useCallback(
    (id: string) =>
      setTrip((t) => ({
        ...t,
        roster: t.roster.map((m) =>
          m.id === id ? { ...m, checkedIn: !m.checkedIn } : m,
        ),
      })),
    [],
  )

  /** Demo helper: lets one browser show what a live roll-call looks like
   * without other travelers' devices. Deliberately excludes index 0 (the
   * current device's own identity — see RollCall.tsx's `trip.roster[0]`)
   * as well as the last 2 entries, so the presenter's own "I'm here"
   * button still requires a real tap and the demo still has a visible
   * "still missing" state to show off. */
  const simulateCheckIns = useCallback(
    () =>
      setTrip((t) => ({
        ...t,
        roster: t.roster.map((m, i) =>
          i > 0 && i < t.roster.length - 2 ? { ...m, checkedIn: true } : m,
        ),
      })),
    [],
  )

  const resetDemo = useCallback(() => {
    const seeded = createSeedTrip()
    setTrip(seeded)
    setRole(null)
  }, [])

  return (
    <TripContext.Provider
      value={{
        trip,
        role,
        join,
        leave,
        switchRole,
        setPin,
        setDeparture,
        setMeetingPoint,
        postAnnouncement,
        startRollCall,
        endRollCall,
        checkIn,
        toggleCheckIn,
        simulateCheckIns,
        resetDemo,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}

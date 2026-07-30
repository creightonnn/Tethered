import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { TripProvider, useTrip } from '../lib/TripProvider'
import { RoleToggle } from './components/RoleToggle'
import Join from './Join'
import Home from './traveler/Home'
import FindBus from './traveler/FindBus'
import Today from './traveler/Today'
import MeetingPoint from './traveler/MeetingPoint'
import RollCall from './traveler/RollCall'
import GuideHome from './guide/GuideHome'
import SetPin from './guide/SetPin'
import SetDeparture from './guide/SetDeparture'
import SetMeetingPoint from './guide/SetMeetingPoint'
import Announce from './guide/Announce'
import GuideRollCall from './guide/GuideRollCall'
import './app.css'

/** Guide gets the dark instrument-panel theme, traveler (and the pre-join
 * screen) gets the calm paper theme — the two role personalities are opposite
 * temperatures of the same brand, see DESIGN.md. */
function ThemeSync() {
  const { role } = useTrip()
  useEffect(() => {
    document.documentElement.dataset.theme = role === 'guide' ? 'guide' : 'traveler'
  }, [role])
  return null
}

function Gate() {
  const { role } = useTrip()
  if (role === 'traveler') return <Navigate to="/app/home" replace />
  if (role === 'guide') return <Navigate to="/app/guide" replace />
  return <Join />
}

function RequireRole({
  role: required,
  children,
}: {
  role: 'traveler' | 'guide'
  children: React.ReactNode
}) {
  const { role } = useTrip()
  if (role !== required) return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function AppShell() {
  return (
    <TripProvider>
      <ThemeSync />
      <RoleToggle />
      <Routes>
        <Route path="/" element={<Gate />} />

        <Route
          path="home"
          element={
            <RequireRole role="traveler">
              <Home />
            </RequireRole>
          }
        />
        <Route
          path="find-bus"
          element={
            <RequireRole role="traveler">
              <FindBus />
            </RequireRole>
          }
        />
        <Route
          path="today"
          element={
            <RequireRole role="traveler">
              <Today />
            </RequireRole>
          }
        />
        <Route
          path="meeting-point"
          element={
            <RequireRole role="traveler">
              <MeetingPoint />
            </RequireRole>
          }
        />
        <Route
          path="roll-call"
          element={
            <RequireRole role="traveler">
              <RollCall />
            </RequireRole>
          }
        />

        <Route
          path="guide"
          element={
            <RequireRole role="guide">
              <GuideHome />
            </RequireRole>
          }
        />
        <Route
          path="guide/pin"
          element={
            <RequireRole role="guide">
              <SetPin />
            </RequireRole>
          }
        />
        <Route
          path="guide/departure"
          element={
            <RequireRole role="guide">
              <SetDeparture />
            </RequireRole>
          }
        />
        <Route
          path="guide/meeting-point"
          element={
            <RequireRole role="guide">
              <SetMeetingPoint />
            </RequireRole>
          }
        />
        <Route
          path="guide/announce"
          element={
            <RequireRole role="guide">
              <Announce />
            </RequireRole>
          }
        />
        <Route
          path="guide/roll-call"
          element={
            <RequireRole role="guide">
              <GuideRollCall />
            </RequireRole>
          }
        />
      </Routes>
    </TripProvider>
  )
}

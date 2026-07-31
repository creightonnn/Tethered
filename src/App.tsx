import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './marketing/Landing'
import Pricing from './marketing/Pricing'
import AppShell from './app/AppShell'
import ThemedRoute from './ThemedRoute'
import BrandBoard from './dev/BrandBoard'

// Resets scroll position on client-side route changes. BrowserRouter does
// not do this itself, and it went unnoticed while `/` was the only
// marketing route — now that `/pricing` (short) sits alongside `/` (long,
// with 160vh story-beat columns), navigating between them without this
// leaves the browser at whatever scroll offset it clamps to, not the top.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <ThemedRoute theme="marketing">
              <Landing />
            </ThemedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ThemedRoute theme="marketing">
              <Pricing />
            </ThemedRoute>
          }
        />
        <Route path="/app/*" element={<AppShell />} />
        <Route
          path="/brand-board"
          element={
            <ThemedRoute theme="marketing">
              <BrandBoard />
            </ThemedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

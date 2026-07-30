import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './marketing/Landing'
import AppShell from './app/AppShell'
import ThemedRoute from './ThemedRoute'
import BrandBoard from './dev/BrandBoard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ThemedRoute theme="marketing">
              <Landing />
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

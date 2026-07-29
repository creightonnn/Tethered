import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './marketing/Landing'
import AppShell from './app/AppShell'
import ThemedRoute from './ThemedRoute'

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
        <Route
          path="/app/*"
          element={
            <ThemedRoute theme="app">
              <AppShell />
            </ThemedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

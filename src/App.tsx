import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PortfolioApp from './portfolio/PortfolioApp'
import ClubDeskApp from './club-desk/ClubDeskApp'

const PlayApp = lazy(() => import('./play/PlayApp'))
const MuseumApp = lazy(() => import('./museum/MuseumApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/club-desk/*" element={<ClubDeskApp />} />
      <Route
        path="/play"
        element={
          <Suspense
            fallback={
              <div className="app-loading">
                <p>Loading play world…</p>
              </div>
            }
          >
            <PlayApp />
          </Suspense>
        }
      />
      <Route
        path="/museum"
        element={
          <Suspense
            fallback={
              <div className="app-loading">
                <p>Loading museum…</p>
              </div>
            }
          >
            <MuseumApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<PortfolioApp />} />
    </Routes>
  )
}

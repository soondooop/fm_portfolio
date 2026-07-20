import { Navigate, Route, Routes } from 'react-router-dom'
import PortfolioApp from './portfolio/PortfolioApp'
import ClubDeskApp from './club-desk/ClubDeskApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioApp />} />
      <Route path="/club-desk/*" element={<ClubDeskApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

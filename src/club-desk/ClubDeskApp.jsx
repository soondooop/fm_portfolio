import { Navigate, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import DeskLayout from './pages/DeskLayout'
import LoginPage from './pages/LoginPage'
import SquadPage from './pages/SquadPage'
import InboxPage from './pages/InboxPage'
import './styles/club-desk.css'

export default function ClubDeskApp() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<DeskLayout />}>
          <Route index element={<Navigate to="squad" replace />} />
          <Route path="squad" element={<SquadPage />} />
          <Route path="inbox" element={<InboxPage />} />
        </Route>
        <Route path="*" element={<Navigate to="squad" replace />} />
      </Routes>
    </Provider>
  )
}

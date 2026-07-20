import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import Toast from '../components/Toast'

export default function DeskLayout() {
  const dispatch = useDispatch()
  const { token, user } = useSelector((s) => s.auth)

  if (!token) {
    return <Navigate to="/club-desk/login" replace />
  }

  return (
    <div className="cd-shell">
      <aside className="cd-shell__nav">
        <div className="cd-brand">
          <span>Club Desk</span>
          <strong>{user?.club || 'North Pitch FC'}</strong>
        </div>

        <nav className="cd-nav">
          <NavLink to="/club-desk/squad">Squad</NavLink>
          <NavLink to="/club-desk/inbox">Inbox</NavLink>
        </nav>

        <div className="cd-shell__foot">
          <p>{user?.name}</p>
          <button
            type="button"
            className="cd-btn cd-btn--ghost"
            onClick={() => dispatch(logout())}
          >
            Logout
          </button>
          <Link className="cd-back-link" to="/">
            ← Scout Report
          </Link>
        </div>
      </aside>

      <main className="cd-shell__main">
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}

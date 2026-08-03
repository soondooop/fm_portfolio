import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import Toast from '../components/Toast'
import { isStaticClubDesk } from '../api/mockStore'

export default function DeskLayout() {
  const dispatch = useAppDispatch()
  const { token, user } = useAppSelector((s) => s.auth)

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
          <Link className="cd-back-link" to="/overview">
            ← Talent Profile
          </Link>
        </div>
      </aside>

      <main className="cd-shell__main">
        {isStaticClubDesk ? (
          <p className="cd-static-banner" role="status">
            정적 데모 모드 · 데이터는 브라우저 메모리에서만 동작하며 새로고침 시 초기화됩니다.
          </p>
        ) : null}
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import ThemeToggle from '../theme/ThemeToggle'
import { PORTFOLIO_ROUTES } from '../types/routes'
import type { Profile } from '../types/portfolio'

interface AppShellProps {
  children: ReactNode
  profile?: Profile
}

export default function AppShell({ children, profile }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="shell">
      <aside className={`shell__nav ${open ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div className="brand">
            <span className="brand__mark">Portfolio Desk</span>
            <span className="brand__name">Kim Seungdo</span>
          </div>
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>

        <ul className="nav-list">
          {PORTFOLIO_ROUTES.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                <span className="nav-list__index">{item.index}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="shell__nav-bottom">
          <ThemeToggle />
          {profile ? (
            <div className="shell__nav-foot">
              {profile.years} years · {profile.position}
              <br />
              {profile.status}
            </div>
          ) : null}
        </div>
      </aside>

      <main className="shell__main">{children}</main>
    </div>
  )
}

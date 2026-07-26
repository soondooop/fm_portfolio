import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import ThemeToggle from '../theme/ThemeToggle'
import { PORTFOLIO_ROUTES } from '../types/routes'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
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
          <div className="shell__nav-foot">
            9 years · Publisher / Frontend
            <br />
            Open to work
          </div>
        </div>
      </aside>

      <main className="shell__main">{children}</main>
    </div>
  )
}

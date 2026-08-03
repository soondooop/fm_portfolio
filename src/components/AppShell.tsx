import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import ThemeToggle from '../theme/ThemeToggle'
import { PORTFOLIO_ROUTES } from '../types/routes'
import { playHudClick } from '../theme/hudAudio'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

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
            className="mobile-nav-toggle hud-interactive"
            aria-expanded={open}
            onClick={() => {
              playHudClick('select')
              setOpen((v) => !v)
            }}
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
                className={({ isActive }) =>
                  isActive ? 'active hud-interactive' : 'hud-interactive'
                }
                onClick={() => {
                  playHudClick('nav')
                  setOpen(false)
                }}
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

      <main key={location.pathname} className="shell__main">
        {children}
      </main>
    </div>
  )
}

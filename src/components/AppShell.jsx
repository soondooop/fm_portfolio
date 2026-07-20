import { useState } from 'react'

const NAV = [
  { id: 'overview', label: 'Overview', index: '01' },
  { id: 'career', label: 'Career', index: '02' },
  { id: 'attributes', label: 'Attributes', index: '03' },
  { id: 'matches', label: 'Match History', index: '04' },
  { id: 'transfer', label: 'Transfer', index: '05' },
]

export default function AppShell({ active, onNavigate, children }) {
  const [open, setOpen] = useState(false)

  const handleNav = (id) => {
    onNavigate(id)
    setOpen(false)
  }

  return (
    <div className="shell">
      <aside className={`shell__nav ${open ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div className="brand">
            <span className="brand__mark">Club Desk</span>
            <span className="brand__name">Scout UI</span>
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
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={active === item.id ? 'page' : undefined}
                onClick={() => handleNav(item.id)}
              >
                <span className="nav-list__index">{item.index}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="shell__nav-foot">
          9 seasons · Publisher / Frontend
          <br />
          Would you sign?
        </div>
      </aside>

      <main className="shell__main">{children}</main>
    </div>
  )
}

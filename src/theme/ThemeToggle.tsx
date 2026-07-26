import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'
import type { ThemePreference } from './ThemeProvider'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M18.5 13.5A7 7 0 0 1 10.5 5.5 7.5 7.5 0 1 0 18.5 13.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function ThemeToggle() {
  const { preference, resolved, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const groupId = useId()

  const selected: 'light' | 'dark' =
    preference === 'system' ? resolved : preference

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onSelect = (value: Extract<ThemePreference, 'light' | 'dark'>) => {
    setPreference(value)
  }

  return (
    <div
      ref={rootRef}
      className={`theme-dock ${open ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="theme-dock__trigger"
        aria-expanded={open}
        aria-controls={`${groupId}-panel`}
        aria-label="테마 선택 열기"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected === 'light' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div
        id={`${groupId}-panel`}
        className="theme-dock__panel"
        role="radiogroup"
        aria-label="테마 선택"
      >
        <label className="theme-dock__option">
          <input
            type="radio"
            name={groupId}
            value="light"
            checked={selected === 'light'}
            onChange={() => onSelect('light')}
          />
          <span className="theme-dock__chip">
            <SunIcon />
            Light
          </span>
        </label>
        <label className="theme-dock__option">
          <input
            type="radio"
            name={groupId}
            value="dark"
            checked={selected === 'dark'}
            onChange={() => onSelect('dark')}
          />
          <span className="theme-dock__chip">
            <MoonIcon />
            Dark
          </span>
        </label>
      </div>
    </div>
  )
}

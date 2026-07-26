interface BootLoaderProps {
  progress: number
  fading: boolean
}

export default function BootLoader({ progress, fading }: BootLoaderProps) {
  const value = Math.min(100, Math.max(0, progress))

  return (
    <div
      className={`boot-loader ${fading ? 'is-fading' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`로딩 ${Math.floor(value)}%`}
    >
      <div className="boot-loader__inner">
        <p className="boot-loader__mark">Portfolio Desk</p>
        <h1 className="boot-loader__title">Kim Seungdo</h1>
        <p className="boot-loader__sub">Preparing profile…</p>

        <div className="boot-loader__gauge" aria-hidden="true">
          <div
            className="boot-loader__fill"
            style={{ width: `${value}%` }}
          />
        </div>

        <div className="boot-loader__meta">
          <span>BOOT</span>
          <strong>{String(Math.floor(value)).padStart(3, '0')}%</strong>
        </div>
      </div>
    </div>
  )
}

const STAT_ORDER = [
  'finishing',
  'passing',
  'technique',
  'vision',
  'composure',
  'acceleration',
  'newGen',
]

export default function StatBars({ stats, labels, animateKey = '' }) {
  return (
    <div className="stat-bars" key={animateKey}>
      {STAT_ORDER.map((key) => {
        const meta = labels[key]
        const value = stats[key] ?? 0
        return (
          <div className="stat-row" key={key}>
            <div className="stat-row__label">
              {meta?.name ?? key}
              {meta?.desc ? <small>{meta.desc}</small> : null}
            </div>
            <div className="stat-row__track" aria-hidden="true">
              <div
                className="stat-row__fill"
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="stat-row__value">{value}</div>
          </div>
        )
      })}
    </div>
  )
}

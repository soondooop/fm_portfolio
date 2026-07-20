const GROUPS = [
  { key: 'technical', title: 'Technical' },
  { key: 'mental', title: 'Mental' },
  { key: 'delivery', title: 'Delivery' },
  { key: 'developing', title: 'New Gen · Developing' },
]

export default function Attributes({ attributes }) {
  return (
    <section className="panel" aria-labelledby="attributes-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Current Attributes</p>
          <h2 id="attributes-title">현재 능력치</h2>
          <p>
            퍼블리싱 강점은 높게, React 계열은 Developing으로 솔직하게
            표기했습니다. 영입 후 성장 여지를 함께 보세요.
          </p>
        </div>
      </div>

      <div className="attr-grid">
        {GROUPS.map((group) => (
          <div className="attr-group" key={group.key}>
            <h3>{group.title}</h3>
            {(attributes[group.key] || []).map((item, index) => (
              <div className="stat-row" key={item.key}>
                <div className="stat-row__label">
                  {item.label}
                  {item.note ? (
                    <span className="note-tag">{item.note}</span>
                  ) : null}
                </div>
                <div className="stat-row__track" aria-hidden="true">
                  <div
                    className="stat-row__fill"
                    style={{
                      width: `${item.value}%`,
                      animationDelay: `${index * 0.05}s`,
                    }}
                  />
                </div>
                <div className="stat-row__value">{item.value}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

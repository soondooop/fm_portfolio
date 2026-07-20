import { useState } from 'react'
import StatBars from './StatBars'

export default function Career({ seasons, statLabels }) {
  const [activeId, setActiveId] = useState(seasons[seasons.length - 1]?.id)
  const active = seasons.find((s) => s.id === activeId) ?? seasons[0]

  return (
    <section className="panel" aria-labelledby="career-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Career Path</p>
          <h2 id="career-title">시즌별 성장 스탯</h2>
          <p>
            2017 데뷔부터 현재까지, 포지션 확장에 따라 능력치가 어떻게
            올라왔는지 스카우트 리포트 형식으로 정리했습니다.
          </p>
        </div>
      </div>

      <div className="career">
        <div className="season-list" role="tablist" aria-label="시즌 선택">
          {seasons.map((season) => (
            <button
              key={season.id}
              type="button"
              role="tab"
              aria-selected={season.id === active.id}
              onClick={() => setActiveId(season.id)}
            >
              <span className="season-list__label">{season.label}</span>
              <span className="season-list__role">{season.role}</span>
            </button>
          ))}
        </div>

        <article className="season-detail" role="tabpanel">
          <div className="season-detail__meta">
            <span>{active.range}</span>
            <span>·</span>
            <span>{active.club}</span>
            <span>·</span>
            <span>{active.role}</span>
          </div>

          <p className="scout-note">{active.scoutNote}</p>

          <StatBars
            stats={active.stats}
            labels={statLabels}
            animateKey={active.id}
          />

          <div className="highlights" aria-label="시즌 하이라이트">
            {active.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

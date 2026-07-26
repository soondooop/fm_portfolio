import { useState } from 'react'
import type { CareerPeriod, SkillKey, SkillLabel } from '../types/portfolio'
import SkillBars from './SkillBars'

interface ExperienceProps {
  experience: CareerPeriod[]
  skillLabels: Record<SkillKey, SkillLabel>
}

export default function Experience({ experience, skillLabels }: ExperienceProps) {
  const [activeId, setActiveId] = useState<string | undefined>(
    experience[experience.length - 1]?.id,
  )
  const active = experience.find((item) => item.id === activeId) ?? experience[0]

  return (
    <section className="panel" aria-labelledby="career-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Career Timeline</p>
          <h2 id="career-title">경력 구간별 역량</h2>
          <p>
            2017년 입문부터 현재까지, 역할 확장에 따라 역량변화를 한눈에 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="career">
        <div className="season-list" role="tablist" aria-label="경력 구간 선택">
          {experience.map((period) => (
            <button
              key={period.id}
              type="button"
              role="tab"
              aria-selected={period.id === active.id}
              onClick={() => setActiveId(period.id)}
            >
              <span className="season-list__label">{period.label}</span>
              <span className="season-list__role">{period.role}</span>
            </button>
          ))}
        </div>

        <article className="season-detail" role="tabpanel">
          <div className="season-detail__meta">
            <span>{active.range}</span>
            <span>·</span>
            <span>{active.company}</span>
            <span>·</span>
            <span>{active.role}</span>
          </div>

          <p className="scout-note">{active.summary}</p>

          <SkillBars
            skills={active.skills}
            labels={skillLabels}
            animateKey={active.id}
          />

          <div className="highlights" aria-label="구간 하이라이트">
            {active.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

import { useId } from 'react'
import type { AttributesData } from '../types/portfolio'
import CountUp from './CountUp'

interface SkillsetGroup {
  key: keyof AttributesData
  title: string
}

const GROUPS: SkillsetGroup[] = [
  { key: 'frontend', title: 'Frontend' },
  { key: 'styling', title: 'Styling' },
  { key: 'designTools', title: 'Design & Tools' },
  { key: 'collaboration', title: 'Collaboration' },
  { key: 'delivery', title: 'Delivery' },
  { key: 'developing', title: 'Modern Stack' },
]

interface SkillsetProps {
  attributes: AttributesData
}

export default function Skillset({ attributes }: SkillsetProps) {
  const mountKey = useId()

  return (
    <section className="panel" aria-labelledby="attributes-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Skill Set</p>
          <h2 id="attributes-title">현재 스킬셋</h2>
          <p>
            디자인, 퍼블리싱부터 시작해 프론트엔드 개발까지 다양한 경험을 통해 성장하고 있습니다.
          </p>
        </div>
      </div>

      <div className="attr-grid" key={mountKey}>
        {GROUPS.map((group) => (
          <div className="attr-group hud-frame hud-interactive" key={group.key}>
            <h3>{group.title}</h3>
            {(attributes[group.key] || []).map((item, index) => (
              <div className="stat-row" key={`${mountKey}-${item.key}`}>
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
                <CountUp
                  className="stat-row__value"
                  value={item.value}
                  delayMs={index * 50}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

import type { AttributesData } from '../types/portfolio'

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
  return (
    <section className="panel" aria-labelledby="attributes-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Skill Set</p>
          <h2 id="attributes-title">현재 스킬셋</h2>
          <p>
            디자인, 퍼블리싱부터 시작해 프론트엔드 개발까지 다양한 경험을 통해 성장하고 있습니다.
          </p>
          <p className="skill-legend">
            <small>
              점수는 0–100 기준 자기 평가 숙련도입니다. 실무 적용 경험과 프로젝트 규모를 고려해 산정했습니다.
            </small>
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

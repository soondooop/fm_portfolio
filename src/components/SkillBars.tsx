import type { SkillScores, SkillKey, SkillLabel } from '../types/portfolio'

const SKILL_ORDER: SkillKey[] = [
  'craft',
  'collab',
  'interaction',
  'structure',
  'stability',
  'learning',
  'modernStack',
]

interface SkillBarsProps {
  skills: SkillScores
  labels: Record<SkillKey, SkillLabel>
  animateKey?: string
}

export default function SkillBars({
  skills,
  labels,
  animateKey = '',
}: SkillBarsProps) {
  return (
    <div className="stat-bars" key={animateKey}>
      {SKILL_ORDER.map((key) => {
        const meta = labels[key]
        const value = skills[key] ?? 0
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

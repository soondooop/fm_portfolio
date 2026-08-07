import type { SkillScores, SkillKey, SkillLabel } from '../types/portfolio'
import CountUp from './CountUp'

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
      {SKILL_ORDER.map((key, index) => {
        const meta = labels[key]
        const value = skills[key] ?? 0
        return (
          <div className="stat-row" key={key}>
            <div className="stat-row__head">
              <div className="stat-row__label">
                {meta?.name ?? key}
                {meta?.desc ? <small>{meta.desc}</small> : null}
              </div>
              <CountUp
                className="stat-row__value"
                value={value}
                delayMs={index * 40}
              />
            </div>
            <div className="stat-row__track" aria-hidden="true">
              <div
                className="stat-row__fill"
                style={{
                  width: `${value}%`,
                  animationDelay: `${index * 0.04}s`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

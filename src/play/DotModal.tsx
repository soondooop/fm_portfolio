import { useEffect, useState } from 'react'
import CountUp from '../components/CountUp'
import type { MatchItem } from '../types/projects'
import type {
  AttributeItem,
  PortfolioData,
  SkillKey,
  SkillScores,
} from '../types/portfolio'
import type { PlaySection } from './events'

const SKILL_ORDER: SkillKey[] = [
  'craft',
  'collab',
  'interaction',
  'structure',
  'stability',
  'learning',
  'modernStack',
]

interface DotModalProps {
  section: PlaySection
  data: PortfolioData
  projects: MatchItem[]
  projectsLoading: boolean
  projectsError: string
  onClose: () => void
}

const TITLES: Record<PlaySection, string> = {
  overview: 'TRAINER CARD',
  experience: 'CAREER LOG',
  skills: 'SKILL DEX',
  projects: 'QUEST LOG',
  contact: 'PC BOX · CONTACT',
}

export default function DotModal({
  section,
  data,
  projects,
  projectsLoading,
  projectsError,
  onClose,
}: DotModalProps) {
  return (
    <div className="dot-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dot-overlay__dim"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="dot-window">
        <div className="dot-window__frame">
          <header className="dot-window__title">
            <span>{TITLES[section]}</span>
            <button
              type="button"
              className="dot-window__x"
              aria-label="닫기"
              onClick={onClose}
            >
              ×
            </button>
          </header>

          <div className="dot-window__body" key={section}>
            {section === 'overview' ? <OverviewDot data={data} /> : null}
            {section === 'experience' ? <ExperienceDot data={data} /> : null}
            {section === 'skills' ? <SkillsDot data={data} /> : null}
            {section === 'projects' ? (
              <ProjectsDot
                projects={projects}
                loading={projectsLoading}
                error={projectsError}
              />
            ) : null}
            {section === 'contact' ? <ContactDot data={data} /> : null}
          </div>

          <footer className="dot-window__hint">
            <span>Press ESC / × to close</span>
            <span className="dot-window__caret" aria-hidden="true">
              ▼
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}

function DotGauge({
  name,
  value,
  delayMs = 0,
}: {
  name: string
  value: number
  delayMs?: number
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWidth(value)
      return
    }
    setWidth(0)
    const id = window.setTimeout(() => setWidth(value), 40 + delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return (
    <div className="dot-bar">
      <span className="dot-bar__name">{name}</span>
      <span className="dot-bar__track" aria-hidden="true">
        <span className="dot-bar__fill" style={{ width: `${width}%` }} />
      </span>
      <CountUp className="dot-bar__num" value={value} delayMs={delayMs} />
    </div>
  )
}

function SkillScoreBlock({
  title,
  scores,
  labels,
  delayBase = 0,
}: {
  title: string
  scores: SkillScores
  labels: PortfolioData['skillLabels']
  delayBase?: number
}) {
  return (
    <div className="dot-skills__block">
      <p className="dot-skills__label">{title}</p>
      {SKILL_ORDER.map((key, index) => (
        <DotGauge
          key={key}
          name={labels[key]?.name ?? key}
          value={scores[key] ?? 0}
          delayMs={delayBase + index * 45}
        />
      ))}
    </div>
  )
}

function AttributeBlock({
  title,
  items,
  delayBase = 0,
}: {
  title: string
  items: AttributeItem[]
  delayBase?: number
}) {
  if (!items?.length) return null
  return (
    <div className="dot-skills__block">
      <p className="dot-skills__label">{title}</p>
      {items.map((item, index) => (
        <DotGauge
          key={item.key}
          name={item.label}
          value={item.value}
          delayMs={delayBase + index * 40}
        />
      ))}
    </div>
  )
}

function OverviewDot({ data }: { data: PortfolioData }) {
  const p = data.profile
  const latest = data.experience[data.experience.length - 1]
  const overall = 92

  return (
    <div className="dot-card">
      <div className="dot-card__sprite" aria-hidden="true">
        <span className="dot-card__face" />
      </div>
      <dl className="dot-stats">
        <div>
          <dt>NAME</dt>
          <dd>{p.displayName || p.name}</dd>
        </div>
        <div>
          <dt>CLASS</dt>
          <dd>{p.shortPosition || p.position}</dd>
        </div>
        <div>
          <dt>LV</dt>
          <dd>{p.years}Y</dd>
        </div>
        <div>
          <dt>STATUS</dt>
          <dd>{p.status}</dd>
        </div>
        <div>
          <dt>AREA</dt>
          <dd>{p.based}</dd>
        </div>
        <div>
          <dt>FOCUS</dt>
          <dd>{p.focus}</dd>
        </div>
      </dl>

      <div className="dot-skills__block">
        <p className="dot-skills__label">OVERALL</p>
        <DotGauge name="종합 능력" value={overall} />
        {latest ? (
          <SkillScoreBlock
            title="CURRENT STATS"
            scores={latest.skills}
            labels={data.skillLabels}
            delayBase={80}
          />
        ) : null}
      </div>

      <p className="dot-dialog">{p.tagline}</p>
      <p className="dot-dialog dot-dialog--muted">{p.bio}</p>
    </div>
  )
}

function ExperienceDot({ data }: { data: PortfolioData }) {
  return (
    <ul className="dot-list">
      {data.experience.map((period, pIndex) => (
        <li key={period.id} className="dot-list__item">
          <div className="dot-list__head">
            <strong>{period.label}</strong>
            <span>{period.range}</span>
          </div>
          <p className="dot-list__meta">
            {period.role} · {period.company}
          </p>
          <p className="dot-dialog dot-dialog--sm">{period.summary}</p>

          <div className="dot-skills__block dot-skills__block--inset">
            <p className="dot-skills__label">STATS</p>
            {SKILL_ORDER.map((key, index) => (
              <DotGauge
                key={`${period.id}-${key}`}
                name={data.skillLabels[key]?.name ?? key}
                value={period.skills[key] ?? 0}
                delayMs={pIndex * 30 + index * 35}
              />
            ))}
          </div>

          {period.highlights?.length ? (
            <ul className="dot-chips">
              {period.highlights.slice(0, 4).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function SkillsDot({ data }: { data: PortfolioData }) {
  const latest = data.experience[data.experience.length - 1]
  const a = data.attributes

  return (
    <div className="dot-skills">
      {latest ? (
        <SkillScoreBlock
          title="BASE STATS"
          scores={latest.skills}
          labels={data.skillLabels}
        />
      ) : null}

      <AttributeBlock title="FRONTEND" items={a.frontend || []} delayBase={40} />
      <AttributeBlock title="STYLING" items={a.styling || []} delayBase={60} />
      <AttributeBlock
        title="DESIGN & TOOLS"
        items={a.designTools || []}
        delayBase={80}
      />
      <AttributeBlock
        title="COLLAB"
        items={a.collaboration || []}
        delayBase={100}
      />
      <AttributeBlock title="DELIVERY" items={a.delivery || []} delayBase={120} />
      <AttributeBlock
        title="MODERN STACK"
        items={a.developing || []}
        delayBase={140}
      />
    </div>
  )
}

function ProjectsDot({
  projects,
  loading,
  error,
}: {
  projects: MatchItem[]
  loading: boolean
  error: string
}) {
  if (loading) return <p className="dot-dialog">Loading quests…</p>
  if (error) return <p className="dot-dialog">{error}</p>

  return (
    <ul className="dot-list">
      {projects.slice(0, 12).map((p) => (
        <li key={p.key} className="dot-list__item dot-list__item--project">
          {p.image ? (
            <div className="dot-thumb">
              <img src={p.image} alt="" loading="lazy" />
            </div>
          ) : (
            <div className="dot-thumb dot-thumb--empty" aria-hidden="true">
              ?
            </div>
          )}
          <div className="dot-list__content">
            <div className="dot-list__head">
              <strong>{p.title}</strong>
              <span>{p.role}</span>
            </div>
            <p className="dot-dialog dot-dialog--sm">{p.summary}</p>
            {p.stack?.length ? (
              <ul className="dot-chips">
                {p.stack.slice(0, 5).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
            {p.link ? (
              <a
                className="dot-link"
                href={p.link}
                target={p.link.startsWith('/') ? undefined : '_blank'}
                rel={p.link.startsWith('/') ? undefined : 'noreferrer'}
              >
                ▶ OPEN
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function ContactDot({ data }: { data: PortfolioData }) {
  const c = data.contact
  return (
    <div className="dot-contact">
      <p className="dot-dialog">{c.headline}</p>
      <p className="dot-dialog dot-dialog--muted">{c.sub}</p>
      <a className="dot-link dot-link--lg" href={`mailto:${c.email}`}>
        ✉ {c.email}
      </a>
      {c.terms?.length ? (
        <ul className="dot-chips">
          {c.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}
      <ul className="dot-menu">
        {c.links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              ▶ {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

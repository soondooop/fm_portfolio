import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { MatchItem } from '../types/projects'
import ProjectsModal from './ProjectsModal'
import { playHudClick } from '../theme/hudAudio'

const PAGE_SIZE = 5

interface ProjectsListProps {
  matches: MatchItem[]
  loading: boolean
  error: string
}

export default function ProjectsList({
  matches,
  loading,
  error,
}: ProjectsListProps) {
  const [tag, setTag] = useState('all')
  const [competition, setCompetition] = useState('all')
  const [selected, setSelected] = useState<MatchItem | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const tags = useMemo(() => {
    const set = new Set<string>()
    matches.forEach((m) => (m.stack || []).forEach((t) => set.add(t)))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [matches])

  const competitions = useMemo(
    () => [...new Set(matches.map((m) => m.competition).filter(Boolean))],
    [matches],
  )

  const filtered = matches.filter((m) => {
    const tagOk = tag === 'all' || (m.stack || []).includes(tag)
    const compOk = competition === 'all' || m.competition === competition
    return tagOk && compOk
  })

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [tag, competition, matches])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const remaining = filtered.length - visibleCount

  return (
    <section className="panel" aria-labelledby="matches-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">Project Log</p>
          <h2 id="matches-title">프로젝트 리스트</h2>
          <p>
            작업해왔던 프로젝트들을 한눈에 확인할 수 있습니다. 
          </p>
        </div>
      </div>

      <div className="filters">
        <label>
          <span className="visually-hidden">유형</span>
          <select
            value={competition}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCompetition(e.target.value)
            }
            aria-label="유형 필터"
          >
            <option value="all">All Types</option>
            {competitions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="visually-hidden">스택</span>
          <select
            value={tag}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTag(e.target.value)
            }
            aria-label="스택 필터"
          >
            <option value="all">All Stacks</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? <p className="cd-state">Loading projects…</p> : null}
      {error ? <p className="cd-error">{error}</p> : null}

      <div className="match-table-wrap hud-frame">
        <table className="match-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Role</th>
              <th>Type</th>
              <th>Stack</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              visible.map((match) => (
                <tr
                  key={match.key}
                  className="hud-interactive"
                  onClick={() => {
                    playHudClick('select')
                    setSelected(match)
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      playHudClick('select')
                      setSelected(match)
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="match-col-project">
                    <div className="match-cell">
                      <div className="match-thumb" aria-hidden="true">
                        {match.image ? (
                          <img src={match.image} alt="" loading="lazy" />
                        ) : (
                          <span className="match-thumb__fallback">CD</span>
                        )}
                      </div>
                      <div className="match-title">
                        <div className="match-title__head">
                          <strong>{match.title}</strong>
                        </div>
                        <p className="match-title__summary">{match.summary}</p>
                        <p className="match-meta match-only-mobile">
                          <span>{match.role}</span>
                          <span className="match-meta__sep" aria-hidden="true">
                            |
                          </span>
                          <span>{match.competition}</span>
                        </p>
                        <div className="stack-list stack-list--compact match-only-mobile">
                          {(match.stack || []).slice(0, 4).map((tech) => (
                            <span className="chip" key={`m-${tech}`}>
                              {tech}
                            </span>
                          ))}
                          {(match.stack || []).length > 4 ? (
                            <span className="chip">
                              +{(match.stack || []).length - 4}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="match-col-role">{match.role}</td>
                  <td className="match-col-type">{match.competition}</td>
                  <td className="match-col-stack">
                    <div className="stack-list stack-list--compact">
                      {(match.stack || []).slice(0, 3).map((tech) => (
                        <span className="chip" key={tech}>
                          {tech}
                        </span>
                      ))}
                      {(match.stack || []).length > 5 ? (
                        <span className="chip">
                          +{(match.stack || []).length - 5}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !error && filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>해당 조건의 프로젝트가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {!loading && hasMore ? (
        <div className="match-more">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            더보기 · {remaining}건 남음
          </button>
        </div>
      ) : null}

      <ProjectsModal match={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

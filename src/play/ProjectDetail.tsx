import type { MatchItem } from '../types/projects'

interface ProjectDetailProps {
  project: MatchItem
  onClose: () => void
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
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
            <span>QUEST DETAIL</span>
            <button
              type="button"
              className="dot-window__x"
              aria-label="닫기"
              onClick={onClose}
            >
              ×
            </button>
          </header>
          <div className="dot-window__body">
            {project.image ? (
              <div className="project-detail__hero">
                <img src={project.image} alt="" />
              </div>
            ) : null}
            <div className="dot-list__head">
              <strong>{project.title}</strong>
              <span>{project.role}</span>
            </div>
            {project.competition ? (
              <p className="dot-dialog dot-dialog--muted">{project.competition}</p>
            ) : null}
            <p className="dot-dialog">{project.summary}</p>
            {project.contribution?.length ? (
              <ul className="dot-list">
                {project.contribution.slice(0, 6).map((line) => (
                  <li key={line} className="dot-list__item">
                    <p className="dot-dialog dot-dialog--sm">· {line}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {project.stack?.length ? (
              <ul className="dot-chips">
                {project.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
            {project.link ? (
              <a
                className="dot-link dot-link--lg"
                href={project.link}
                target={project.link.startsWith('/') ? undefined : '_blank'}
                rel={project.link.startsWith('/') ? undefined : 'noreferrer'}
              >
                ▶ OPEN PROJECT
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

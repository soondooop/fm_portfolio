import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { MatchItem } from '../types/projects'

interface MatchModalProps {
  match: MatchItem | null
  onClose: () => void
}

export default function MatchModal({ match, onClose }: MatchModalProps) {
  useEffect(() => {
    if (!match) return undefined

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [match, onClose])

  if (!match) return null

  const stack = match.stack || []
  const contribution = match.contribution || []

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="modal__head">
          <div>
            <p className="eyebrow">{match.competition || 'Project'}</p>
            <h3 id="match-modal-title">{match.title}</h3>
          </div>
          <button
            type="button"
            className="modal__close"
            aria-label="닫기"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {match.image ? (
          <div className="modal__image">
            <img src={match.image} alt="" />
          </div>
        ) : null}

        <div className="modal__meta">
          <span className="chip">
            Role <strong>{match.role || 'Publisher'}</strong>
          </span>
        </div>

        <p>{match.summary}</p>

        {stack.length ? (
          <div className="stack-list" aria-label="사용 스택">
            {stack.map((tech) => (
              <span className="chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        {contribution.length ? (
          <>
            <p className="eyebrow">Contribution</p>
            <ul>
              {contribution.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {match.link ? (
          match.link.startsWith('/') ? (
            <Link className="btn btn--primary" to={match.link} onClick={onClose}>
              프로젝트 열기
            </Link>
          ) : (
            <a
              className="btn btn--primary"
              href={match.link}
              target="_blank"
              rel="noreferrer"
            >
              사이트 보기
            </a>
          )
        ) : (
          <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
            외부 링크가 아직 없습니다.
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}

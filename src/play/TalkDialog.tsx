import { Link } from 'react-router-dom'
import type { PlayTalkPayload } from './events'

interface TalkDialogProps {
  talk: PlayTalkPayload
  lineIndex: number
  onNext: () => void
  onClose: () => void
}

export default function TalkDialog({
  talk,
  lineIndex,
  onNext,
  onClose,
}: TalkDialogProps) {
  const line = talk.lines[lineIndex] ?? ''
  const isLast = lineIndex >= talk.lines.length - 1

  return (
    <div className="talk-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="talk-overlay__dim"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="talk-box">
        <div className="talk-box__frame">
          <p className="talk-box__speaker">{talk.speaker}</p>
          <p className="talk-box__line">{line}</p>
          <div className="talk-box__actions">
            {isLast && talk.link ? (
              talk.link.href.startsWith('/') ? (
                <Link className="talk-box__link" to={talk.link.href} onClick={onClose}>
                  ▶ {talk.link.label}
                </Link>
              ) : (
                <a
                  className="talk-box__link"
                  href={talk.link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                >
                  ▶ {talk.link.label}
                </a>
              )
            ) : null}
            <button
              type="button"
              className="talk-box__next"
              onClick={isLast ? onClose : onNext}
            >
              {isLast ? '닫기' : '다음 ▼'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

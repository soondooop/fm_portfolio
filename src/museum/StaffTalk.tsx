interface StaffTalkProps {
  lines: string[]
  lineIndex: number
  onNext: () => void
  onClose: () => void
  speaker?: string
  /** Label on the last-line button */
  doneLabel?: string
}

export default function StaffTalk({
  lines,
  lineIndex,
  onNext,
  onClose,
  speaker = '안내 직원',
  doneLabel = '닫기',
}: StaffTalkProps) {
  const line = lines[lineIndex] ?? ''
  const isLast = lineIndex >= lines.length - 1

  return (
    <div className="museum-talk" role="dialog" aria-modal="true">
      <button
        type="button"
        className="museum-talk__dim"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="museum-talk__bubble">
        <p className="museum-talk__speaker">{speaker}</p>
        <p className="museum-talk__line">{line}</p>
        <div className="museum-talk__actions">
          <button
            type="button"
            className="museum-talk__next"
            onClick={isLast ? onClose : onNext}
          >
            {isLast ? doneLabel : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}

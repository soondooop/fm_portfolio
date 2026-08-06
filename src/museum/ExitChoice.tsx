interface ExitChoiceProps {
  onPick: (href: string) => void
  onClose: () => void
}

const CHOICES = [
  {
    href: '/overview',
    title: 'Classic Portfolio',
    blurb: '소개·경력·프로젝트를 한눈에 보는 웹 포트폴리오',
    tone: 'classic' as const,
  },
  {
    href: '/play',
    title: 'SOONDOOOP Town',
    blurb: '마을을 거닐며 작품을 탐험하는 인터랙티브 타운',
    tone: 'town' as const,
  },
]

export default function ExitChoice({ onPick, onClose }: ExitChoiceProps) {
  return (
    <div className="museum-exit" role="dialog" aria-modal="true">
      <button
        type="button"
        className="museum-exit__dim"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="museum-exit__panel">
        <p className="museum-exit__eyebrow">Exit</p>
        <h2 className="museum-exit__title">어디로 나갈까요?</h2>
        <p className="museum-exit__sub">
          Classic 포트폴리오 또는 Town 중 하나를 선택하세요.
        </p>
        <div className="museum-exit__choices">
          {CHOICES.map((c) => (
            <button
              key={c.href}
              type="button"
              className={`museum-exit__choice museum-exit__choice--${c.tone}`}
              onClick={() => onPick(c.href)}
            >
              <strong>{c.title}</strong>
              <span>{c.blurb}</span>
            </button>
          ))}
        </div>
        <button type="button" className="museum-exit__cancel" onClick={onClose}>
          박물관에 머무르기
        </button>
      </div>
    </div>
  )
}

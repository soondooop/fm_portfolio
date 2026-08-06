import { Link } from 'react-router-dom'

interface PlayIntroProps {
  onPlay: () => void
  ready: boolean
}

export default function PlayIntro({ onPlay, ready }: PlayIntroProps) {
  return (
    <div className="play-intro" role="dialog" aria-label="SOONDOOOP TOWN 인트로">
      <div className="play-intro__bg" aria-hidden="true" />
      <div className="play-intro__panel">
        <p className="play-intro__mark">PIXEL PORTFOLIO</p>
        <h1 className="play-intro__title">SOONDOOOP TOWN</h1>
        <p className="play-intro__copy">
          마을을 탐험하며 Overview · Experience · Skills · Projects Village ·
          Contact를 열어보세요.
        </p>
        <div className="play-intro__actions">
          <button
            type="button"
            className="play-intro__play"
            onClick={onPlay}
            disabled={!ready}
          >
            {ready ? 'Play' : 'Loading…'}
          </button>
          <Link className="play-intro__skip" to="/museum">
            Museum 3D
          </Link>
          <Link className="play-intro__skip" to="/overview">
            Skip to classic
          </Link>
        </div>
        <p className="play-intro__hint">WASD 이동 · E 상호작용 · 모바일은 가상 패드</p>
      </div>
    </div>
  )
}

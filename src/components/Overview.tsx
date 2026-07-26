import { Link } from 'react-router-dom'
import type { Profile } from '../types/portfolio'

interface OverviewProps {
  profile: Profile
}

export default function Overview({ profile }: OverviewProps) {
  const overall = 92

  return (
    <section className="panel hero" aria-labelledby="overview-title">
      <div className="hero__copy">
        <p className="eyebrow">Talent Profile · Open to Work</p>
        <div className="hero__jersey" aria-hidden="true">
          #{profile.id}
        </div>
        <h1 id="overview-title">{profile.name}</h1>
        <p className="hero__position">{profile.position}</p>
        <p className="hero__tagline">{profile.tagline}</p>

        <div className="hero__meta">
          <span className="chip">
            Exp <strong>{profile.years}years</strong>
          </span>
          <span className="chip">
            Status <strong>{profile.status}</strong>
          </span>
          <span className="chip">
            Based <strong>{profile.based}</strong>
          </span>
          <span className="chip">
            Focus <strong>{profile.focus}</strong>
          </span>
        </div>

        <div className="hero__actions">
          <Link className="btn btn--primary" to="/contact">
            제안하기
          </Link>
          <Link className="btn btn--ghost" to="/projects">
            프로젝트 보기
          </Link>
          <Link className="btn btn--ghost" to="/experience">
            경력 역량
          </Link>
        </div>
      </div>

      <aside className="player-card" aria-label="프로필 카드">
        <div className="player-card__head">
          <div className="player-card__top">
            <div>
              <div className="player-card__club">{profile.status}</div>
              <h2 className="player-card__name">
                {profile.displayName || profile.name}
              </h2>
              <p className="player-card__role">{profile.shortPosition}</p>
            </div>
            <div className="player-card__badge">{profile.id}</div>
          </div>

          {profile.portrait ? (
            <div className="player-card__photo">
              <img
                src={profile.portrait}
                alt={`${profile.displayName || profile.name} 프로필 사진`}
              />
            </div>
          ) : null}
        </div>

        <div className="player-card__stats">
          <div className="player-card__stat">
            <span>Overall</span>
            <strong>{overall}</strong>
          </div>
          <div className="player-card__stat">
            <span>Years</span>
            <strong>{profile.years}</strong>
          </div>
          <div className="player-card__stat">
            <span>Since</span>
            <strong>2017</strong>
          </div>
        </div>
      </aside>
    </section>
  )
}

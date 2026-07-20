export default function Overview({ player, onNavigate }) {
  const currentAbility = 84

  return (
    <section className="panel hero" aria-labelledby="overview-title">
      <div className="hero__copy">
        <p className="eyebrow">Scout Report · Free Agent</p>
        <div className="hero__jersey" aria-hidden="true">
          #{player.id}
        </div>
        <h1 id="overview-title">{player.name}</h1>
        <p className="hero__position">{player.position}</p>
        <p className="hero__tagline">{player.tagline}</p>

        <div className="hero__meta">
          <span className="chip">
            Seasons <strong>{player.seasons}</strong>
          </span>
          <span className="chip">
            Club <strong>{player.club}</strong>
          </span>
          <span className="chip">
            NAT <strong>{player.nationality}</strong>
          </span>
          <span className="chip">
            Style <strong>{player.preferredFoot}</strong>
          </span>
        </div>

        <div className="hero__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('transfer')}
          >
            영입하시겠습니까?
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onNavigate('matches')}
          >
            출전 기록 보기
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onNavigate('career')}
          >
            시즌 스탯
          </button>
        </div>
      </div>

      <aside className="player-card" aria-label="선수 카드">
        <div className="player-card__head">
          <div className="player-card__top">
            <div>
              <div className="player-card__club">{player.club}</div>
              <h2 className="player-card__name">
                {player.displayName || player.name}
              </h2>
              <p className="player-card__role">{player.shortPosition}</p>
            </div>
            <div className="player-card__badge">{player.id}</div>
          </div>

          {player.portrait ? (
            <div className="player-card__photo">
              <img
                src={player.portrait}
                alt={`${player.displayName || player.name} 증명사진`}
              />
            </div>
          ) : null}
        </div>

        <div className="player-card__stats">
          <div className="player-card__stat">
            <span>CA</span>
            <strong>{currentAbility}</strong>
          </div>
          <div className="player-card__stat">
            <span>Seasons</span>
            <strong>{player.seasons}</strong>
          </div>
          <div className="player-card__stat">
            <span>Debut</span>
            <strong>2017</strong>
          </div>
        </div>
      </aside>
    </section>
  )
}

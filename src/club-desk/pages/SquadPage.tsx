import { useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import Pagination from '../components/Pagination'
import PlayerModal from '../components/PlayerModal'
import {
  loadPlayers,
  removePlayer,
  removeSelectedPlayers,
  setSquadQuery,
} from '../features/squad/squadSlice'
import {
  clearPlayers,
  setPlayers,
  togglePlayer,
} from '../features/selection/selectionSlice'
import { openModal } from '../features/ui/uiSlice'

function formatWage(value: number): string {
  return `€${Number(value).toLocaleString()}`
}

export default function SquadPage() {
  const dispatch = useAppDispatch()
  const { players, total, status, error, query } = useAppSelector((s) => s.squad)
  const selected = useAppSelector((s) => s.selection.selectedPlayerIds)

  useEffect(() => {
    dispatch(loadPlayers())
  }, [dispatch, query.page, query.q, query.position, query.status])

  const allChecked =
    players.length > 0 && players.every((p) => selected.includes(p.id))

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')
    dispatch(setSquadQuery({ q: String(q || ''), page: 1 }))
  }

  return (
    <section className="cd-page">
      <header className="cd-page__head">
        <div>
          <p className="cd-eyebrow">Squad Office</p>
          <h2>스쿼드 명단</h2>
          <p>검색·필터·CRUD·일괄 방출로 선수단을 관리합니다.</p>
        </div>
        <div className="cd-page__actions">
          <button
            type="button"
            className="cd-btn cd-btn--primary"
            onClick={() => dispatch(openModal({ mode: 'create' }))}
          >
            선수 등록
          </button>
          <button
            type="button"
            className="cd-btn cd-btn--danger"
            disabled={!selected.length}
            onClick={() => {
              if (window.confirm(`${selected.length}명을 방출할까요?`)) {
                dispatch(removeSelectedPlayers())
              }
            }}
          >
            일괄 방출 ({selected.length})
          </button>
        </div>
      </header>

      <div className="cd-toolbar">
        <form onSubmit={onSearch} className="cd-search">
          <input name="q" defaultValue={query.q} placeholder="선수 이름 검색" />
          <button type="submit" className="cd-btn cd-btn--ghost">
            Search
          </button>
        </form>
        <select
          value={query.position}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            dispatch(setSquadQuery({ position: e.target.value, page: 1 }))
          }
          aria-label="포지션 필터"
        >
          <option value="">All Positions</option>
          <option value="GK">GK</option>
          <option value="DF">DF</option>
          <option value="MF">MF</option>
          <option value="FW">FW</option>
        </select>
        <select
          value={query.status}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            dispatch(setSquadQuery({ status: e.target.value, page: 1 }))
          }
          aria-label="상태 필터"
        >
          <option value="">All Status</option>
          <option value="available">available</option>
          <option value="injured">injured</option>
          <option value="loaned">loaned</option>
        </select>
      </div>

      {status === 'loading' ? <p className="cd-state">Loading squad…</p> : null}
      {error ? <p className="cd-error">{error}</p> : null}
      {status === 'succeeded' && players.length === 0 ? (
        <p className="cd-state">조건에 맞는 선수가 없습니다.</p>
      ) : null}

      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.checked) {
                      dispatch(setPlayers(players.map((p) => p.id)))
                    } else {
                      dispatch(clearPlayers())
                    }
                  }}
                  aria-label="전체 선택"
                />
              </th>
              <th>No.</th>
              <th>Name</th>
              <th>Pos</th>
              <th>Age</th>
              <th>Rating</th>
              <th>Wage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(player.id)}
                    onChange={() => dispatch(togglePlayer(player.id))}
                    aria-label={`${player.name} 선택`}
                  />
                </td>
                <td>{player.number}</td>
                <td>
                  <strong>{player.name}</strong>
                  <small>{player.nationality}</small>
                </td>
                <td>{player.position}</td>
                <td>{player.age}</td>
                <td className="cd-rating">{player.rating}</td>
                <td>{formatWage(player.wage)}</td>
                <td>
                  <span className={`cd-status cd-status--${player.status}`}>
                    {player.status}
                  </span>
                </td>
                <td>
                  <div className="cd-row-actions">
                    <button
                      type="button"
                      className="cd-btn cd-btn--ghost"
                      onClick={() =>
                        dispatch(
                          openModal({ mode: 'edit', playerId: player.id }),
                        )
                      }
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="cd-btn cd-btn--danger"
                      onClick={() => {
                        if (window.confirm(`${player.name}을(를) 방출할까요?`)) {
                          dispatch(removePlayer(player.id))
                        }
                      }}
                    >
                      방출
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={query.page}
        limit={query.limit}
        total={total}
        onChange={(page) => dispatch(setSquadQuery({ page }))}
      />

      <PlayerModal />
    </section>
  )
}

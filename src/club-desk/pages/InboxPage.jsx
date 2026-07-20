import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Pagination from '../components/Pagination'
import {
  bulkRejectOffers,
  loadOffers,
  respondToOffer,
  setInboxQuery,
} from '../features/inbox/inboxSlice'
import {
  clearOffers,
  setOffers,
  toggleOffer,
} from '../features/selection/selectionSlice'

function formatFee(offer) {
  if (offer.type === 'contract') return 'Contract talks'
  return `€${Number(offer.fee).toLocaleString()}`
}

export default function InboxPage() {
  const dispatch = useDispatch()
  const { offers, total, status, error, query } = useSelector((s) => s.inbox)
  const selected = useSelector((s) => s.selection.selectedOfferIds)

  useEffect(() => {
    dispatch(loadOffers())
  }, [dispatch, query.page, query.status, query.type])

  const pendingRows = offers.filter((o) => o.status === 'pending')
  const allChecked =
    pendingRows.length > 0 &&
    pendingRows.every((o) => selected.includes(o.id))

  return (
    <section className="cd-page">
      <header className="cd-page__head">
        <div>
          <p className="cd-eyebrow">Transfer Inbox</p>
          <h2>이적 · 계약 제안</h2>
          <p>제안을 수락/거절하고, 선택된 pending 건을 일괄 거절합니다.</p>
        </div>
        <div className="cd-page__actions">
          <button
            type="button"
            className="cd-btn cd-btn--danger"
            disabled={!selected.length}
            onClick={() => {
              if (window.confirm(`${selected.length}건을 일괄 거절할까요?`)) {
                dispatch(bulkRejectOffers())
              }
            }}
          >
            일괄 거절 ({selected.length})
          </button>
        </div>
      </header>

      <div className="cd-toolbar">
        <select
          value={query.status}
          onChange={(e) =>
            dispatch(setInboxQuery({ status: e.target.value, page: 1 }))
          }
          aria-label="상태 필터"
        >
          <option value="">All Status</option>
          <option value="pending">pending</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
        </select>
        <select
          value={query.type}
          onChange={(e) =>
            dispatch(setInboxQuery({ type: e.target.value, page: 1 }))
          }
          aria-label="유형 필터"
        >
          <option value="">All Types</option>
          <option value="transfer">transfer</option>
          <option value="contract">contract</option>
          <option value="loan">loan</option>
        </select>
      </div>

      {status === 'loading' ? <p className="cd-state">Loading inbox…</p> : null}
      {error ? <p className="cd-error">{error}</p> : null}
      {status === 'succeeded' && offers.length === 0 ? (
        <p className="cd-state">조건에 맞는 제안이 없습니다.</p>
      ) : null}

      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      dispatch(setOffers(pendingRows.map((o) => o.id)))
                    } else {
                      dispatch(clearOffers())
                    }
                  }}
                  aria-label="pending 전체 선택"
                />
              </th>
              <th>Type</th>
              <th>Player</th>
              <th>From</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const pending = offer.status === 'pending'
              return (
                <tr key={offer.id}>
                  <td>
                    <input
                      type="checkbox"
                      disabled={!pending}
                      checked={selected.includes(offer.id)}
                      onChange={() => dispatch(toggleOffer(offer.id))}
                      aria-label={`${offer.playerName} 제안 선택`}
                    />
                  </td>
                  <td>{offer.type}</td>
                  <td>
                    <strong>{offer.playerName}</strong>
                  </td>
                  <td>{offer.fromClub}</td>
                  <td>{formatFee(offer)}</td>
                  <td>
                    <span className={`cd-status cd-status--${offer.status}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td>{offer.createdAt}</td>
                  <td>
                    {pending ? (
                      <div className="cd-row-actions">
                        <button
                          type="button"
                          className="cd-btn cd-btn--primary"
                          onClick={() =>
                            dispatch(
                              respondToOffer({
                                id: offer.id,
                                status: 'accepted',
                              }),
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="cd-btn cd-btn--danger"
                          onClick={() =>
                            dispatch(
                              respondToOffer({
                                id: offer.id,
                                status: 'rejected',
                              }),
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="cd-muted">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={query.page}
        limit={query.limit}
        total={total}
        onChange={(page) => dispatch(setInboxQuery({ page }))}
      />
    </section>
  )
}

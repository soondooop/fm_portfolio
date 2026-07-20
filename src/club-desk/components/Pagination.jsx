export default function Pagination({ page, limit, total, onChange }) {
  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="cd-pagination">
      <button
        type="button"
        className="cd-btn cd-btn--ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span>
        {page} / {pageCount}
        <small> · {total} items</small>
      </span>
      <button
        type="button"
        className="cd-btn cd-btn--ghost"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}

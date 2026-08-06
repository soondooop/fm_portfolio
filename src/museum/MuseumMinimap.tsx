import { MAP, ROOMS } from './layout'
import type { MuseumState } from './createMuseum'

interface MuseumMinimapProps {
  state: MuseumState | null
  expanded: boolean
  onToggle: () => void
  onClose: () => void
}

const VIEW = {
  minX: MAP.minX,
  maxX: MAP.maxX,
  minZ: MAP.minZ,
  maxZ: MAP.maxZ,
}

function pct(v: number, min: number, max: number) {
  return ((v - min) / (max - min)) * 100
}

function MapWorld({ state, large }: { state: MuseumState; large?: boolean }) {
  return (
    <div
      className={`museum-minimap__world${large ? ' museum-minimap__world--large' : ''}`}
    >
      {ROOMS.map((room) => (
        <span
          key={room.id}
          className="museum-minimap__room"
          style={{
            left: `${pct(room.x - room.w / 2, VIEW.minX, VIEW.maxX)}%`,
            top: `${pct(room.z - room.d / 2, VIEW.minZ, VIEW.maxZ)}%`,
            width: `${(room.w / (VIEW.maxX - VIEW.minX)) * 100}%`,
            height: `${(room.d / (VIEW.maxZ - VIEW.minZ)) * 100}%`,
            background: room.color,
          }}
        >
          <span className="museum-minimap__label">{room.label}</span>
        </span>
      ))}
      <span
        className="museum-minimap__player"
        style={{
          left: `${pct(state.x, VIEW.minX, VIEW.maxX)}%`,
          top: `${pct(state.z, VIEW.minZ, VIEW.maxZ)}%`,
        }}
      />
    </div>
  )
}

export default function MuseumMinimap({
  state,
  expanded,
  onToggle,
  onClose,
}: MuseumMinimapProps) {
  if (!state) return null

  return (
    <>
      <button
        type="button"
        className="museum-minimap"
        aria-label="지도 크게 보기"
        title="지도 · M"
        onClick={onToggle}
      >
        <div className="museum-minimap__frame">
          <div className="museum-minimap__title">
            MUSEUM MAP <span className="museum-minimap__hint">M</span>
          </div>
          <MapWorld state={state} />
        </div>
      </button>

      {expanded ? (
        <div
          className="museum-map-overlay"
          role="dialog"
          aria-label="박물관 지도"
          onClick={onClose}
        >
          <div
            className="museum-map-overlay__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="museum-map-overlay__head">
              <strong>Museum Map</strong>
              <span>M / Esc 닫기</span>
              <button
                type="button"
                className="museum-map-overlay__close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <MapWorld state={state} large />
          </div>
        </div>
      ) : null}
    </>
  )
}

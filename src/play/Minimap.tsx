import type { PlaySection, PlayWorldState } from './events'
import { PLAY_SECTIONS } from './events'

interface Marker {
  id: string
  label: string
  x: number
  y: number
  color: string
  visited?: boolean
}

interface MinimapProps {
  state: PlayWorldState | null
  visited: PlaySection[]
  markers?: Marker[]
}

const DEFAULT_MARKERS: Omit<Marker, 'visited'>[] = [
  { id: 'overview', label: 'O', x: 300, y: 200, color: '#6eb0ff' },
  { id: 'experience', label: 'E', x: 900, y: 200, color: '#8ec5ff' },
  { id: 'skills', label: 'S', x: 1500, y: 200, color: '#f0c36a' },
  { id: 'projects', label: 'P', x: 480, y: 1040, color: '#7dd3a0' },
  { id: 'contact', label: 'C', x: 1320, y: 520, color: '#ef7b6a' },
]

export default function Minimap({
  state,
  visited,
  markers = DEFAULT_MARKERS,
}: MinimapProps) {
  if (!state) return null
  const { x, y, mapW, mapH } = state
  const visitedSet = new Set(visited)

  return (
    <div className="minimap" aria-hidden="true">
      <div className="minimap__frame">
        <div className="minimap__title">MAP</div>
        <div className="minimap__world">
          {markers.map((m) => {
            const section = PLAY_SECTIONS.find((s) => s.id === m.id)
            const isVisited = section
              ? visitedSet.has(section.id)
              : Boolean(m.visited)
            return (
              <span
                key={m.id}
                className={`minimap__mark${isVisited ? ' is-visited' : ''}`}
                style={{
                  left: `${(m.x / mapW) * 100}%`,
                  top: `${(m.y / mapH) * 100}%`,
                  background: m.color,
                }}
                title={m.label}
              >
                {m.label}
              </span>
            )
          })}
          <span
            className="minimap__player"
            style={{
              left: `${(x / mapW) * 100}%`,
              top: `${(y / mapH) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

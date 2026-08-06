import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { PlayBoothScreen, PlayProjectBooth } from './events'

export interface ProjectSignsHandle {
  apply: (booths: PlayBoothScreen[]) => void
}

interface ProjectSignsProps {
  items: PlayProjectBooth[]
}

const ProjectSigns = forwardRef<ProjectSignsHandle, ProjectSignsProps>(
  function ProjectSigns({ items }, ref) {
    const nodesRef = useRef(new Map<string, HTMLElement>())
    const [ready, setReady] = useState(false)
    const readyRef = useRef(false)

    useImperativeHandle(ref, () => ({
      apply(booths) {
        if (!booths.length) return
        let placed = 0
        const seen = new Set<string>()
        for (const b of booths) {
          seen.add(b.key)
          const el = nodesRef.current.get(b.key)
          if (!el) continue
          placed += 1
          const w = Math.max(8, b.w)
          const h = Math.max(6, b.h)
          el.style.width = `${w}px`
          el.style.height = `${h}px`
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%)`
          el.style.visibility =
            b.x < -80 || b.y < -80 || b.x > 4000 || b.y > 3000
              ? 'hidden'
              : 'visible'
        }
        nodesRef.current.forEach((el, key) => {
          if (!seen.has(key)) el.style.visibility = 'hidden'
        })
        if (placed > 0 && !readyRef.current) {
          readyRef.current = true
          setReady(true)
        }
      },
    }))

    if (!items.length) return null

    return (
      <div
        className={`project-signs${ready ? ' is-ready' : ''}`}
        aria-hidden="true"
      >
        {items.map((item) => (
          <SignThumb
            key={item.key}
            item={item}
            register={(el) => {
              if (el) nodesRef.current.set(item.key, el)
              else nodesRef.current.delete(item.key)
            }}
          />
        ))}
      </div>
    )
  },
)

export default ProjectSigns

function SignThumb({
  item,
  register,
}: {
  item: PlayProjectBooth
  register: (el: HTMLElement | null) => void
}) {
  const [failed, setFailed] = useState(false)

  if (!item.image || failed) {
    return (
      <div
        ref={register}
        className="project-signs__fallback"
        title={item.title}
      >
        ?
      </div>
    )
  }

  return (
    <img
      ref={register}
      className="project-signs__thumb"
      src={item.image}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

import { useRef, type MutableRefObject, type PointerEvent } from 'react'
import type { PlayInputState } from './events'

interface VirtualPadProps {
  stickRef: MutableRefObject<PlayInputState>
}

export default function VirtualPad({ stickRef }: VirtualPadProps) {
  const origin = useRef<{ x: number; y: number } | null>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const reset = () => {
    origin.current = null
    stickRef.current = { x: 0, y: 0 }
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    origin.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    onMove(e)
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!origin.current) return
    const dx = e.clientX - origin.current.x
    const dy = e.clientY - origin.current.y
    const max = 42
    const len = Math.hypot(dx, dy) || 1
    const clamped = Math.min(len, max)
    const nx = (dx / len) * clamped
    const ny = (dy / len) * clamped
    stickRef.current = { x: nx / max, y: ny / max }
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`
    }
  }

  return (
    <div
      className="play-pad"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={reset}
      onPointerCancel={reset}
      aria-label="이동 패드"
    >
      <div className="play-pad__knob" ref={knobRef} />
    </div>
  )
}

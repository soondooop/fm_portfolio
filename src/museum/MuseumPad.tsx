import { useRef, type MutableRefObject, type PointerEvent } from 'react'
import type { LookStickState, StickState } from './MuseumGame'

interface MuseumPadProps {
  stickRef: MutableRefObject<StickState>
  lookStickRef: MutableRefObject<LookStickState>
}

function Stick({
  label,
  onChange,
  clear,
  className,
}: {
  label: string
  onChange: (x: number, y: number) => void
  clear: () => void
  className: string
}) {
  const origin = useRef<{ x: number; y: number } | null>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const reset = () => {
    origin.current = null
    clear()
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
    onChange(nx / max, ny / max)
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`
    }
  }

  return (
    <div
      className={className}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={reset}
      onPointerCancel={reset}
      aria-label={label}
    >
      <div className="museum-pad__knob" ref={knobRef} />
    </div>
  )
}

export default function MuseumPad({ stickRef, lookStickRef }: MuseumPadProps) {
  return (
    <div className="museum-pads">
      <Stick
        className="museum-pad museum-pad--move"
        label="이동"
        onChange={(x, y) => {
          stickRef.current = { x, y }
        }}
        clear={() => {
          stickRef.current = { x: 0, y: 0 }
        }}
      />
      <Stick
        className="museum-pad museum-pad--look"
        label="시야"
        onChange={(x, y) => {
          lookStickRef.current = { x, y }
        }}
        clear={() => {
          lookStickRef.current = { x: 0, y: 0 }
        }}
      />
    </div>
  )
}

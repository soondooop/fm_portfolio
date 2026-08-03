import { useEffect, useState } from 'react'

interface CountUpProps {
  value: number
  durationMs?: number
  delayMs?: number
  className?: string
}

export default function CountUp({
  value,
  durationMs = 700,
  delayMs = 0,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    setDisplay(0)
    let raf = 0
    let start: number | null = null

    const timeout = window.setTimeout(() => {
      const tick = (ts: number) => {
        if (start === null) start = ts
        const t = Math.min(1, (ts - start) / durationMs)
        const eased = 1 - (1 - t) * (1 - t)
        setDisplay(Math.round(value * eased))
        if (t < 1) raf = window.requestAnimationFrame(tick)
      }
      raf = window.requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(raf)
    }
  }, [value, durationMs, delayMs])

  return (
    <div className={className} aria-label={String(value)}>
      {display}
    </div>
  )
}

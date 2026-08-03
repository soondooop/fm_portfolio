import { useEffect } from 'react'

/**
 * Drives CSS vars for the fixed grid backdrop so it gently
 * zooms / parallax-shifts toward the pointer (StarCraft-HUD vibe).
 */
export default function GridPointerFx() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return undefined

    const root = document.documentElement
    let raf = 0
    let running = true
    let targetX = 0.5
    let targetY = 0.5
    let currentX = 0.5
    let currentY = 0.5

    const apply = () => {
      currentX += (targetX - currentX) * 0.07
      currentY += (targetY - currentY) * 0.07

      const ox = `${(currentX * 100).toFixed(2)}%`
      const oy = `${(currentY * 100).toFixed(2)}%`
      // Slightly stronger zoom near edges for a living grid feel
      const fromCenter = Math.hypot(currentX - 0.5, currentY - 0.5)
      const zoom = 1.04 + fromCenter * 0.1

      root.style.setProperty('--grid-ox', ox)
      root.style.setProperty('--grid-oy', oy)
      root.style.setProperty('--grid-zoom', zoom.toFixed(3))
      root.style.setProperty(
        '--grid-shift-x',
        `${((currentX - 0.5) * -28).toFixed(1)}px`,
      )
      root.style.setProperty(
        '--grid-shift-y',
        `${((currentY - 0.5) * -28).toFixed(1)}px`,
      )

      if (running) raf = window.requestAnimationFrame(apply)
    }

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      targetX = Math.min(1, Math.max(0, e.clientX / w))
      targetY = Math.min(1, Math.max(0, e.clientY / h))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = window.requestAnimationFrame(apply)

    return () => {
      running = false
      window.cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      root.style.removeProperty('--grid-ox')
      root.style.removeProperty('--grid-oy')
      root.style.removeProperty('--grid-zoom')
      root.style.removeProperty('--grid-shift-x')
      root.style.removeProperty('--grid-shift-y')
    }
  }, [])

  return null
}

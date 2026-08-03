/** Soft UI blip for HUD interactions. No-ops when reduced-motion is on. */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

/** `nav` = left menu (current click). `select` = in-section controls. */
export function playHudClick(kind: 'nav' | 'select' = 'select'): void {
  const audio = getCtx()
  if (!audio) return

  if (audio.state === 'suspended') {
    void audio.resume()
  }

  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()

  if (kind === 'nav') {
    osc.type = 'square'
    osc.frequency.value = 520
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(now)
    osc.stop(now + 0.08)
    return
  }

  // Section select: softer triangle tick, lower than nav
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(310, now + 0.06)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.032, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + 0.12)
}

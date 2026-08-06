/**
 * Museum audio — soft classical-style piano loop + interaction cues.
 */

export type MuseumSfxKind = 'notice' | 'interact' | 'ui'

export interface MuseumAudioHandle {
  unlock: () => void
  setMusicMuted: (muted: boolean) => void
  isMusicMuted: () => boolean
  playSfx: (kind: MuseumSfxKind) => void
  dispose: () => void
}

const MUSIC_LEVEL = 0.22
const BEAT = 0.78

/** Original gentle salon-piano phrase (C major / A minor color). */
const PHRASE: { beat: number; freq: number; dur: number; vel: number }[] = [
  // Left-hand arpeggio — bar 1 (C)
  { beat: 0, freq: 130.81, dur: 1.4, vel: 0.22 },
  { beat: 0.5, freq: 196.0, dur: 1.1, vel: 0.16 },
  { beat: 1, freq: 261.63, dur: 1.1, vel: 0.18 },
  { beat: 1.5, freq: 329.63, dur: 1.0, vel: 0.14 },
  // Melody
  { beat: 0, freq: 523.25, dur: 1.5, vel: 0.32 },
  { beat: 1.5, freq: 587.33, dur: 0.7, vel: 0.26 },
  { beat: 2, freq: 659.25, dur: 1.6, vel: 0.3 },
  { beat: 3.5, freq: 587.33, dur: 0.7, vel: 0.24 },

  // Bar 2 (Am)
  { beat: 4, freq: 110.0, dur: 1.4, vel: 0.22 },
  { beat: 4.5, freq: 164.81, dur: 1.1, vel: 0.16 },
  { beat: 5, freq: 220.0, dur: 1.1, vel: 0.18 },
  { beat: 5.5, freq: 261.63, dur: 1.0, vel: 0.14 },
  { beat: 4, freq: 440.0, dur: 1.5, vel: 0.3 },
  { beat: 5.5, freq: 523.25, dur: 0.7, vel: 0.24 },
  { beat: 6, freq: 587.33, dur: 1.6, vel: 0.28 },
  { beat: 7.5, freq: 523.25, dur: 0.7, vel: 0.22 },

  // Bar 3 (F)
  { beat: 8, freq: 87.31, dur: 1.4, vel: 0.2 },
  { beat: 8.5, freq: 174.61, dur: 1.1, vel: 0.15 },
  { beat: 9, freq: 220.0, dur: 1.1, vel: 0.17 },
  { beat: 9.5, freq: 261.63, dur: 1.0, vel: 0.13 },
  { beat: 8, freq: 349.23, dur: 1.4, vel: 0.28 },
  { beat: 9.5, freq: 392.0, dur: 0.7, vel: 0.24 },
  { beat: 10, freq: 440.0, dur: 1.5, vel: 0.3 },
  { beat: 11.5, freq: 392.0, dur: 0.7, vel: 0.22 },

  // Bar 4 (G → C)
  { beat: 12, freq: 98.0, dur: 1.4, vel: 0.2 },
  { beat: 12.5, freq: 146.83, dur: 1.1, vel: 0.15 },
  { beat: 13, freq: 196.0, dur: 1.1, vel: 0.17 },
  { beat: 13.5, freq: 246.94, dur: 1.0, vel: 0.13 },
  { beat: 12, freq: 392.0, dur: 1.2, vel: 0.28 },
  { beat: 13.5, freq: 440.0, dur: 0.6, vel: 0.24 },
  { beat: 14, freq: 493.88, dur: 0.7, vel: 0.26 },
  { beat: 14.75, freq: 523.25, dur: 1.8, vel: 0.32 },
]

const PHRASE_BEATS = 16

function makeReverb(ctx: AudioContext): ConvolverNode {
  const seconds = 3.4
  const rate = ctx.sampleRate
  const length = Math.floor(rate * seconds)
  const buffer = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / length
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * 0.4
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = buffer
  return conv
}

/** Soft piano-like tone: partials + hammer click + exponential decay. */
function playPianoNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  when: number,
  dur: number,
  velocity: number,
) {
  if (musicMutedGate) return
  const amp = Math.max(0.001, velocity)

  const noteGain = ctx.createGain()
  noteGain.connect(dest)
  noteGain.gain.setValueAtTime(0.0001, when)
  noteGain.gain.exponentialRampToValueAtTime(amp, when + 0.018)
  noteGain.gain.exponentialRampToValueAtTime(amp * 0.45, when + 0.22)
  noteGain.gain.exponentialRampToValueAtTime(0.0001, when + dur)

  const partials: [number, number, OscillatorType][] = [
    [1, 1, 'sine'],
    [2, 0.42, 'sine'],
    [3, 0.18, 'sine'],
    [4.01, 0.08, 'triangle'],
  ]

  for (const [mul, level, type] of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq * mul, when)
    g.gain.value = level
    osc.connect(g)
    g.connect(noteGain)
    osc.start(when)
    osc.stop(when + dur + 0.05)
  }

  // Soft hammer noise
  const noiseLen = Math.floor(ctx.sampleRate * 0.03)
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen)
  }
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuf
  const nFilter = ctx.createBiquadFilter()
  nFilter.type = 'bandpass'
  nFilter.frequency.value = Math.min(4200, freq * 6)
  nFilter.Q.value = 0.8
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(amp * 0.12, when)
  nGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.04)
  noise.connect(nFilter)
  nFilter.connect(nGain)
  nGain.connect(noteGain)
  noise.start(when)
  noise.stop(when + 0.05)
}

/** Shared mute flag so scheduled notes stay silent when muted. */
let musicMutedGate = false

export function createMuseumAudio(): MuseumAudioHandle {
  let ctx: AudioContext | null = null
  let musicGain: GainNode | null = null
  let sfxGain: GainNode | null = null
  let musicMuted = false
  let musicRunning = false
  let loopTimer = 0
  let phraseStart = 0

  function ensure() {
    if (ctx) return ctx
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()

    musicGain = ctx.createGain()
    musicGain.gain.value = 0
    sfxGain = ctx.createGain()
    sfxGain.gain.value = 0.55

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 5200
    filter.Q.value = 0.4

    const dry = ctx.createGain()
    dry.gain.value = 0.72
    const wet = ctx.createGain()
    wet.gain.value = 0.48
    const reverb = makeReverb(ctx)

    musicGain.connect(filter)
    filter.connect(dry)
    filter.connect(reverb)
    reverb.connect(wet)
    dry.connect(ctx.destination)
    wet.connect(ctx.destination)
    sfxGain.connect(ctx.destination)

    return ctx
  }

  function schedulePhrase(at: number) {
    if (!ctx || !musicGain) return
    for (const note of PHRASE) {
      playPianoNote(
        ctx,
        musicGain,
        note.freq,
        at + note.beat * BEAT,
        note.dur,
        musicMuted ? 0 : note.vel,
      )
    }
  }

  function armLoop() {
    if (!ctx || !musicRunning) return
    const now = ctx.currentTime
    if (phraseStart < now + 0.05) phraseStart = now + 0.08
    schedulePhrase(phraseStart)
    const next = phraseStart + PHRASE_BEATS * BEAT
    phraseStart = next
    const waitMs = Math.max(50, (next - ctx.currentTime - 0.35) * 1000)
    loopTimer = window.setTimeout(armLoop, waitMs)
  }

  function fadeMusic(to: number, seconds: number) {
    if (!ctx || !musicGain) return
    const now = ctx.currentTime
    musicGain.gain.cancelScheduledValues(now)
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), now)
    musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, to), now + seconds)
  }

  function startMusic() {
    const audio = ensure()
    if (!audio || !musicGain) return
    void audio.resume().then(() => {
      if (!ctx || !musicGain) return
      if (musicRunning) {
        if (!musicMuted) fadeMusic(MUSIC_LEVEL, 0.6)
        return
      }
      musicRunning = true
      musicMutedGate = musicMuted
      phraseStart = ctx.currentTime + 0.12
      fadeMusic(musicMuted ? 0.0001 : MUSIC_LEVEL, 1.2)
      armLoop()
    })
  }

  return {
    unlock() {
      startMusic()
    },
    setMusicMuted(muted) {
      musicMuted = muted
      musicMutedGate = muted
      if (!musicRunning) {
        if (!muted) startMusic()
        return
      }
      fadeMusic(muted ? 0.0001 : MUSIC_LEVEL, 0.4)
      if (!muted && ctx) {
        window.clearTimeout(loopTimer)
        phraseStart = ctx.currentTime + 0.08
        armLoop()
      }
    },
    isMusicMuted() {
      return musicMuted
    },
    playSfx(kind) {
      const audio = ensure()
      if (!audio || !sfxGain) return
      void audio.resume().then(() => {
        if (!ctx || !sfxGain) return
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(sfxGain)

        if (kind === 'notice') {
          osc.type = 'sine'
          osc.frequency.setValueAtTime(523.25, now)
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09)
          gain.gain.setValueAtTime(0.0001, now)
          gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
          osc.start(now)
          osc.stop(now + 0.26)
          return
        }

        if (kind === 'interact') {
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(392, now)
          osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.07)
          gain.gain.setValueAtTime(0.0001, now)
          gain.gain.exponentialRampToValueAtTime(0.1, now + 0.015)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
          osc.start(now)
          osc.stop(now + 0.18)
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(784, now + 0.05)
          gain2.gain.setValueAtTime(0.0001, now + 0.05)
          gain2.gain.exponentialRampToValueAtTime(0.045, now + 0.07)
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
          osc2.connect(gain2)
          gain2.connect(sfxGain)
          osc2.start(now + 0.05)
          osc2.stop(now + 0.22)
          return
        }

        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.055, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
        osc.start(now)
        osc.stop(now + 0.1)
      })
    },
    dispose() {
      musicRunning = false
      window.clearTimeout(loopTimer)
      try {
        musicGain?.disconnect()
        sfxGain?.disconnect()
        void ctx?.close()
      } catch {
        /* ignore */
      }
      ctx = null
      musicGain = null
      sfxGain = null
    },
  }
}

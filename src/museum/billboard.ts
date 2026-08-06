import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { Profile } from '../types/portfolio'
import { MAP, OVERVIEW_BOARD, PROP_SCALE } from './layout'

const CANVAS_W = 1600
const CANVAS_H = 900

type Phase = 'boot' | 'photo' | 'type' | 'done'

interface OverviewAnim {
  group: THREE.Group
  update: (dt: number) => void
  dispose: () => void
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines = 6,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) {
        lines[lines.length - 1] = `${lines[lines.length - 1]}…`
        return lines
      }
    } else line = test
  }
  if (line && lines.length < maxLines) lines.push(line)
  return lines
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 1,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  const ir = img.naturalWidth / img.naturalHeight
  const br = w / h
  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (ir > br) {
    sw = img.naturalHeight * br
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / br
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

export function createOverviewBillboard(profile: Profile): OverviewAnim {
  const group = new THREE.Group()
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { group, update: () => undefined, dispose: () => undefined }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true

  const pivot = new THREE.Group()
  pivot.position.set(OVERVIEW_BOARD.x, 0, OVERVIEW_BOARD.z)
  pivot.rotation.y = OVERVIEW_BOARD.yaw
  const screenY = MAP.wallH / 2

  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(
      OVERVIEW_BOARD.w + 0.35 * PROP_SCALE,
      OVERVIEW_BOARD.h + 0.35 * PROP_SCALE,
      0.22 * PROP_SCALE,
      3,
      0.14 * PROP_SCALE,
    ),
    new THREE.MeshStandardMaterial({
      color: '#1c1e22',
      roughness: 0.55,
      metalness: 0.08,
    }),
  )
  frame.position.set(0, screenY, 0)
  frame.castShadow = true
  pivot.add(frame)

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(OVERVIEW_BOARD.w, OVERVIEW_BOARD.h),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
  )
  screen.position.set(0, screenY, 0.13 * PROP_SCALE)
  pivot.add(screen)

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(
      OVERVIEW_BOARD.w + 0.5 * PROP_SCALE,
      OVERVIEW_BOARD.h + 0.5 * PROP_SCALE,
    ),
    new THREE.MeshBasicMaterial({
      color: '#7ec8e8',
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    }),
  )
  glow.position.set(0, screenY, -0.08 * PROP_SCALE)
  pivot.add(glow)
  group.add(pivot)

  let portrait: HTMLImageElement | null = null
  if (profile.portrait) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      portrait = img
    }
    img.src = profile.portrait
  }

  const photoX = 72
  const photoY = 120
  const photoW = 420
  const photoH = 520
  const textX = photoX + photoW + 56
  const textMaxW = CANVAS_W - textX - 72

  const name = profile.displayName || profile.name
  const position = profile.position || ''
  const tagline = profile.tagline || ''
  const bio = profile.bio || ''
  const meta = `${profile.years} years  ·  ${profile.based}  ·  ${profile.status}`

  ctx.font = '400 30px DM Sans, Segoe UI, sans-serif'
  const tagLines = wrapLines(ctx, tagline, textMaxW, 3)
  ctx.font = '400 24px DM Sans, Segoe UI, sans-serif'
  const bioLines = wrapLines(ctx, bio, textMaxW, 4)

  const typeSequence: { text: string; full: string }[] = [
    { text: '', full: 'OVERVIEW' },
    { text: '', full: name },
    { text: '', full: position },
    ...tagLines.map((l) => ({ text: '', full: l })),
    ...bioLines.map((l) => ({ text: '', full: l })),
    { text: '', full: meta },
  ]

  // Remove ambient blobs — static bg only; caret blink remains after typing
  let phase: Phase = 'boot'
  let phaseT = 0
  let photoAlpha = 0
  let typeIndex = 0
  let time = 0
  let accum = 0
  let lastCaretOn: boolean | null = null
  let staticCache: HTMLCanvasElement | null = null

  // 1.25× faster than previous intro timing
  const PHOTO_DUR = 1.15 / 1.25
  const TYPE_CPS = 38 * 1.25
  const INTRO_FPS = 20
  const DONE_FPS = 6

  function drawAmbientBg() {
    const w = CANVAS_W
    const h = CANVAS_H
    ctx.fillStyle = '#121820'
    ctx.fillRect(0, 0, w, h)
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#1a3048')
    grad.addColorStop(1, '#243048')
    ctx.fillStyle = grad
    ctx.fillRect(28, 28, w - 56, h - 56)
  }

  /** Frame + photo share the same alpha so they appear together */
  function drawPhotoBlock(alpha: number) {
    if (alpha <= 0.01) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(photoX - 8, photoY - 8, photoW + 16, photoH + 16)

    if (portrait && portrait.complete && portrait.naturalWidth > 0) {
      // drawCoverImage also uses globalAlpha — reset then multiply
      ctx.globalAlpha = 1
      drawCoverImage(ctx, portrait, photoX, photoY, photoW, photoH, alpha)
    } else {
      ctx.fillStyle = '#2a3a4c'
      ctx.fillRect(photoX, photoY, photoW, photoH)
      ctx.fillStyle = 'rgba(232,228,220,0.45)'
      ctx.font = '500 28px DM Sans, Segoe UI, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('PHOTO', photoX + photoW / 2, photoY + photoH / 2)
    }
    ctx.restore()
  }

  function measureCaret(index: number, text: string) {
    let y = 110
    let h = 36
    ctx.save()
    if (index === 0) {
      ctx.font = '600 36px DM Sans, Segoe UI, sans-serif'
      y = 110
      h = 36
    } else if (index === 1) {
      ctx.font = '600 72px Fraunces, Georgia, serif'
      y = 210
      h = 64
    } else if (index === 2) {
      ctx.font = '500 36px DM Sans, Segoe UI, sans-serif'
      y = 275
      h = 36
    } else if (index < 3 + tagLines.length) {
      ctx.font = '400 30px DM Sans, Segoe UI, sans-serif'
      y = 360 + (index - 3) * 42
      h = 30
    } else if (index < 3 + tagLines.length + bioLines.length) {
      ctx.font = '400 24px DM Sans, Segoe UI, sans-serif'
      y = 480 + (index - 3 - tagLines.length) * 34
      h = 24
    } else {
      ctx.font = '500 26px DM Sans, Segoe UI, sans-serif'
      y = CANVAS_H - 80
      h = 26
    }
    const x = textX + ctx.measureText(text).width
    ctx.restore()
    return { x, y, h }
  }

  function drawTypedText(showCaret: boolean) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    let si = 0

    const overview = typeSequence[si++]
    ctx.fillStyle = '#7dd3a0'
    ctx.font = '600 36px DM Sans, Segoe UI, sans-serif'
    ctx.fillText(overview.text, textX, 110)

    const nameLine = typeSequence[si++]
    ctx.fillStyle = '#e8e4dc'
    ctx.font = '600 72px Fraunces, Georgia, serif'
    ctx.fillText(nameLine.text, textX, 210)

    const posLine = typeSequence[si++]
    ctx.fillStyle = '#e0b45c'
    ctx.font = '500 36px DM Sans, Segoe UI, sans-serif'
    ctx.fillText(posLine.text, textX, 275)

    ctx.fillStyle = 'rgba(232,228,220,0.92)'
    ctx.font = '400 30px DM Sans, Segoe UI, sans-serif'
    for (let i = 0; i < tagLines.length; i++) {
      ctx.fillText(typeSequence[si++].text, textX, 360 + i * 42)
    }

    ctx.fillStyle = 'rgba(232,228,220,0.72)'
    ctx.font = '400 24px DM Sans, Segoe UI, sans-serif'
    for (let i = 0; i < bioLines.length; i++) {
      ctx.fillText(typeSequence[si++].text, textX, 480 + i * 34)
    }

    const metaLine = typeSequence[si++]
    ctx.fillStyle = 'rgba(232,228,220,0.7)'
    ctx.font = '500 26px DM Sans, Segoe UI, sans-serif'
    ctx.fillText(metaLine.text, textX, CANVAS_H - 80)

    if (showCaret) {
      drawEndCaret(phase === 'type' ? Math.min(typeIndex, typeSequence.length - 1) : typeSequence.length - 1)
    }
  }

  function drawEndCaret(caretIndex: number) {
    const caretText =
      phase === 'type'
        ? typeSequence[caretIndex].text
        : typeSequence[typeSequence.length - 1].text
    const idx = phase === 'type' ? caretIndex : typeSequence.length - 1
    const m = measureCaret(idx, caretText)
    if (Math.floor(time * 2.2) % 2 === 0) {
      ctx.fillStyle = 'rgba(125, 211, 160, 0.95)'
      ctx.fillRect(m.x + 6, m.y - m.h + 6, 3, m.h - 4)
    }
  }

  function bakeStatic() {
    drawAmbientBg()
    drawPhotoBlock(1)
    for (const line of typeSequence) line.text = line.full
    drawTypedText(false)
    if (!staticCache) {
      staticCache = document.createElement('canvas')
      staticCache.width = CANVAS_W
      staticCache.height = CANVAS_H
    }
    const sctx = staticCache.getContext('2d')!
    sctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    sctx.drawImage(canvas, 0, 0)
  }

  function paintFrame() {
    if (phase === 'boot') {
      phaseT += 1 / INTRO_FPS
      drawAmbientBg()
      if (phaseT > 0.2) {
        phase = 'photo'
        phaseT = 0
      }
    } else if (phase === 'photo') {
      phaseT += 1 / INTRO_FPS
      photoAlpha = Math.min(1, phaseT / PHOTO_DUR)
      drawAmbientBg()
      drawPhotoBlock(photoAlpha)
      if (phaseT >= PHOTO_DUR) {
        phase = 'type'
        phaseT = 0
        photoAlpha = 1
      }
    } else if (phase === 'type') {
      phaseT += 1 / INTRO_FPS
      photoAlpha = 1
      drawAmbientBg()
      drawPhotoBlock(1)
      const chars = Math.floor(phaseT * TYPE_CPS)
      let consumed = 0
      typeIndex = 0
      for (let i = 0; i < typeSequence.length; i++) {
        const full = typeSequence[i].full
        if (consumed + full.length <= chars) {
          typeSequence[i].text = full
          consumed += full.length
          typeIndex = i + 1
        } else {
          typeSequence[i].text = full.slice(0, Math.max(0, chars - consumed))
          typeIndex = i
          for (let j = i + 1; j < typeSequence.length; j++) {
            typeSequence[j].text = ''
          }
          break
        }
      }
      const total = typeSequence.reduce((s, l) => s + l.full.length, 0)
      if (chars >= total) {
        for (const line of typeSequence) line.text = line.full
        typeIndex = typeSequence.length - 1
        phase = 'done'
        phaseT = 0
        bakeStatic()
      }
      drawTypedText(true)
    } else {
      // done: blit cached static + caret only (cheap)
      if (!staticCache) bakeStatic()
      ctx.drawImage(staticCache!, 0, 0)
      drawEndCaret(typeSequence.length - 1)
    }

    tex.needsUpdate = true
  }

  paintFrame()

  return {
    group,
    update(dt) {
      time += dt
      accum += dt
      const fps = phase === 'done' ? DONE_FPS : INTRO_FPS
      const step = 1 / fps
      if (accum < step) return

      if (phase === 'done') {
        const caretOn = Math.floor(time * 2.2) % 2 === 0
        if (caretOn === lastCaretOn && accum < step * 2) return
        lastCaretOn = caretOn
        accum = 0
        paintFrame()
        return
      }

      accum = 0
      paintFrame()
    },
    dispose() {
      tex.dispose()
    },
  }
}

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type {
  CareerPeriod,
  SkillKey,
  SkillLabel,
  SkillScores,
} from '../types/portfolio'
import { EXPERIENCE_GALLERY, PROP_SCALE } from './layout'

/** Wide wall panels — sized to fit Experience span (stops at Contact) */
const PANEL_H = 10.5
const FRAME_D = 0.12 * PROP_SCALE
const FRAME_PAD = 0.28 * PROP_SCALE
const PANEL_GAP = 2.8

function panelWidthForCount(count: number): number {
  const { w, margin } = EXPERIENCE_GALLERY
  const usable = Math.max(20, w - margin * 2)
  if (count <= 1) return Math.min(18, usable)
  const raw = (usable - PANEL_GAP * (count - 1)) / count
  return Math.max(10, Math.min(16, raw))
}

const CANVAS_W = 1600
const CANVAS_H = 900

const SKILL_ORDER: SkillKey[] = [
  'craft',
  'collab',
  'interaction',
  'structure',
  'stability',
  'learning',
  'modernStack',
]

const ACCENTS = ['#c4a35a', '#5eb3c8', '#ef9a8a', '#7a9e7e']

interface HangSlot {
  x: number
  z: number
  yaw: number
}

function careerSortKey(period: CareerPeriod): number {
  const m = period.id.match(/(\d{4})/)
  if (m) return Number(m[1])
  const r = period.range.match(/(\d{4})/)
  return r ? Number(r[1]) : 0
}

function sortChronological(list: CareerPeriod[]): CareerPeriod[] {
  return [...list].sort((a, b) => careerSortKey(a) - careerSortKey(b))
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = w
      if (lines.length >= maxLines) break
    } else {
      line = next
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines && line && words.length) {
    const joined = words.join(' ')
    const shown = lines.join(' ')
    if (shown.length < joined.length) {
      let t = lines[maxLines - 1]
      while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
        t = t.slice(0, -1)
      }
      lines[maxLines - 1] = `${t}…`
    }
  }
  return lines
}

function paintCareerBoard(
  ctx: CanvasRenderingContext2D,
  period: CareerPeriod,
  accent: string,
  index: number,
  skillLabels: Record<SkillKey, SkillLabel> | null,
) {
  const w = CANVAS_W
  const h = CANVAS_H
  const pad = 48
  const colGap = 48
  const leftW = Math.floor(w * 0.58) - pad
  const rightX = pad + leftW + colGap
  const rightW = w - rightX - pad

  ctx.fillStyle = '#16181c'
  ctx.fillRect(0, 0, w, h)
  const wash = ctx.createLinearGradient(0, 0, w, h)
  wash.addColorStop(0, 'rgba(40, 48, 56, 0.35)')
  wash.addColorStop(1, 'rgba(20, 24, 28, 0)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 5
  ctx.strokeRect(22, 22, w - 44, h - 44)

  ctx.fillStyle = accent
  ctx.fillRect(pad, pad, 12, 72)

  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.font = '600 22px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`CAREER 0${index + 1}`, pad + 28, pad + 18)

  ctx.fillStyle = 'rgba(255,244,230,0.97)'
  ctx.font = '700 56px Fraunces, Georgia, serif'
  ctx.fillText(period.label, pad + 28, pad + 64)

  ctx.fillStyle = accent
  ctx.font = '600 26px DM Sans, Segoe UI, sans-serif'
  ctx.fillText(period.range, pad + 28, pad + 118)

  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  ctx.font = '700 36px DM Sans, Segoe UI, sans-serif'
  ctx.fillText(period.company, pad + 28, pad + 168)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 26px DM Sans, Segoe UI, sans-serif'
  ctx.fillText(period.role, pad + 28, pad + 208)

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.moveTo(pad, 280)
  ctx.lineTo(pad + leftW, 280)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,248,238,0.86)'
  ctx.font = '500 26px DM Sans, Segoe UI, sans-serif'
  const summaryLines = wrapLines(ctx, period.summary, leftW - 8, 7)
  summaryLines.forEach((line, i) => {
    ctx.fillText(line, pad + 4, 320 + i * 36)
  })

  const chipTop = 320 + summaryLines.length * 36 + 36
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = '600 18px DM Sans, Segoe UI, sans-serif'
  ctx.fillText('HIGHLIGHTS', pad + 4, chipTop)

  let chipX = pad + 4
  let chipRow = 0
  ctx.font = '600 20px DM Sans, Segoe UI, sans-serif'
  for (const chip of period.highlights) {
    const tw = ctx.measureText(chip).width + 32
    if (chipX + tw > pad + leftW) {
      chipX = pad + 4
      chipRow += 1
      if (chipRow > 2) break
    }
    const cy = chipTop + 36 + chipRow * 48
    if (cy > h - 56) break
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(chipX, cy - 18, tw, 36)
    ctx.strokeStyle = `${accent}99`
    ctx.lineWidth = 2
    ctx.strokeRect(chipX, cy - 18, tw, 36)
    ctx.fillStyle = 'rgba(255,248,238,0.92)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(chip, chipX + 16, cy)
    chipX += tw + 14
  }

  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = '600 18px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('STATS', rightX, pad + 18)

  const scores: SkillScores = period.skills
  const rowH = 102
  const barH = 14
  const trackW = rightW - 8
  SKILL_ORDER.forEach((key, i) => {
    const y = pad + 56 + i * rowH
    const meta = skillLabels?.[key]
    const name = meta?.name ?? key
    const desc = meta?.desc ?? ''
    const value = scores[key] ?? 0

    // Title left + score on the title’s right
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = '600 24px DM Sans, Segoe UI, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(name, rightX, y)

    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = '700 24px DM Sans, Segoe UI, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(value), rightX + rightW, y)

    if (desc) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '500 16px DM Sans, Segoe UI, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(desc, rightX, y + 22)
    }

    const barY = y + (desc ? 40 : 28)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(rightX, barY, trackW, barH)
    ctx.fillStyle = accent
    ctx.fillRect(rightX, barY, Math.max(6, (value / 100) * trackW), barH)
  })
}

function makeAccentMural(
  title: string,
  subtitle: string,
  accent: string,
  w: number,
  h: number,
): THREE.Mesh {
  const cw = 900
  const ch = 1200
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, 0, ch)
  g.addColorStop(0, '#1c2228')
  g.addColorStop(0.55, '#242a30')
  g.addColorStop(1, '#1a1e22')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, cw, ch)

  // Soft abstract arcs
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.strokeStyle = `${accent}${22 + i * 8}`
    ctx.lineWidth = 18 - i * 2
    ctx.arc(cw * 0.5, ch * 0.72, 180 + i * 70, Math.PI * 1.05, Math.PI * 1.95)
    ctx.stroke()
  }

  ctx.fillStyle = accent
  ctx.fillRect(72, 96, 14, 90)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '600 28px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(subtitle, 104, 120)

  ctx.fillStyle = 'rgba(255,244,230,0.96)'
  ctx.font = '700 72px Fraunces, Georgia, serif'
  ctx.fillText(title, 104, 210)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 3
  ctx.strokeRect(40, 40, cw - 80, ch - 80)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  )
}

/**
 * North wall boards — when facing the wall from inside the room (looking +Z),
 * Three.js camera has screen-left = world +X. Place oldest on the east so
 * Career 01 reads on the left and Career 04 on the right.
 */
function buildNorthSlots(count: number, panelW: number): HangSlot[] {
  const { x: cx, z: cz, w, d, wallT, margin } = EXPERIENCE_GALLERY
  const halfW = w / 2
  const halfD = d / 2
  const northZ = cz + halfD - wallT * 0.55
  const west = cx - halfW + margin + panelW * 0.5
  const east = cx + halfW - margin - panelW * 0.5
  const slots: HangSlot[] = []
  if (count <= 0) return slots
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1)
    // i=0 (oldest) → east (screen-left); last (newest) → west (screen-right)
    slots.push({
      x: east + (west - east) * t,
      z: northZ,
      yaw: Math.PI,
    })
  }
  return slots
}

function placeCareerBoard(
  parent: THREE.Object3D,
  period: CareerPeriod,
  slot: HangSlot,
  index: number,
  skillLabels: Record<SkillKey, SkillLabel> | null,
  panelW: number,
) {
  const y = PANEL_H * 0.52 + 0.9
  const accent = ACCENTS[index % ACCENTS.length]
  const pivot = new THREE.Group()
  pivot.position.set(slot.x, y, slot.z)
  pivot.rotation.y = slot.yaw
  parent.add(pivot)

  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(
      panelW + FRAME_PAD,
      PANEL_H + FRAME_PAD,
      FRAME_D,
      2,
      0.08 * PROP_SCALE,
    ),
    new THREE.MeshStandardMaterial({
      color: '#1c1e22',
      roughness: 0.55,
      metalness: 0.08,
    }),
  )
  frame.castShadow = true
  pivot.add(frame)

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')!
  paintCareerBoard(ctx, period, accent, index, skillLabels)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mat = new THREE.MeshBasicMaterial({ map: tex })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(panelW, PANEL_H), mat)
  mesh.position.z = FRAME_D * 0.55
  pivot.add(mesh)

  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(panelW * 0.7, 0.1 * PROP_SCALE, 0.45 * PROP_SCALE),
    new THREE.MeshStandardMaterial({ color: '#3a2e24', roughness: 0.8 }),
  )
  shelf.position.set(0, -PANEL_H * 0.52, 0.18 * PROP_SCALE)
  pivot.add(shelf)

  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(panelW * 0.35, 0.12, 0.35),
    new THREE.MeshStandardMaterial({
      color: '#c9b48a',
      roughness: 0.35,
      metalness: 0.45,
      emissive: '#6a5a3a',
      emissiveIntensity: 0.35,
    }),
  )
  lightBar.position.set(0, PANEL_H * 0.52 + 0.35, 0.2)
  pivot.add(lightBar)
}

function addPlanter(
  parent: THREE.Object3D,
  x: number,
  z: number,
  pot: THREE.Material,
  leaf: THREE.Material,
) {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  parent.add(g)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.7, 0.9, 10),
    pot,
  )
  base.position.y = 0.45
  base.castShadow = true
  g.add(base)
  const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), leaf)
  foliage.position.y = 1.45
  foliage.scale.set(1, 1.15, 1)
  g.add(foliage)
  const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), leaf)
  foliage2.position.set(0.35, 1.7, -0.15)
  g.add(foliage2)
}

function addExperienceDecor(parent: THREE.Object3D) {
  const { x: cx, z: cz, d, wallT } = EXPERIENCE_GALLERY
  const halfW = EXPERIENCE_GALLERY.w / 2
  const halfD = d / 2
  const inset = wallT * 0.55

  const wood = new THREE.MeshStandardMaterial({
    color: '#3a2e24',
    roughness: 0.82,
  })
  const brass = new THREE.MeshStandardMaterial({
    color: '#b8a06a',
    roughness: 0.4,
    metalness: 0.55,
  })
  const pot = new THREE.MeshStandardMaterial({
    color: '#6a5344',
    roughness: 0.88,
  })
  const leaf = new THREE.MeshStandardMaterial({
    color: '#3d6b4a',
    roughness: 0.9,
  })
  const trim = new THREE.MeshStandardMaterial({
    color: '#2a2e32',
    roughness: 0.6,
  })

  // Timeline / rail / wainscot strips removed — walls stay clean

  // West wall mural — origin
  {
    const muralW = Math.min(7.5, halfD * 0.55)
    const muralH = 11
    const mural = makeAccentMural(
      'ORIGIN',
      'WHERE IT BEGAN',
      ACCENTS[0],
      muralW,
      muralH,
    )
    mural.position.set(cx - halfW + inset, 6.2, cz)
    mural.rotation.y = Math.PI / 2
    parent.add(mural)
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(muralW + 0.2, muralH + 0.2, 0.18, 2, 0.06),
      trim,
    )
    frame.position.copy(mural.position)
    frame.position.x -= 0.12
    frame.rotation.y = Math.PI / 2
    parent.add(frame)
  }

  // East wall mural — present (solid wall; no passage to Contact)
  {
    const mural = makeAccentMural('PRESENT', 'STILL WRITING', ACCENTS[3], 7.5, 11)
    mural.position.set(cx + halfW - inset, 6.2, cz)
    mural.rotation.y = -Math.PI / 2
    parent.add(mural)
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(7.7, 11.2, 0.18, 2, 0.06),
      trim,
    )
    frame.position.copy(mural.position)
    frame.position.x += 0.12
    frame.rotation.y = -Math.PI / 2
    parent.add(frame)
  }

  // Corner planters — avoid Hall door clear zone on south
  const corners: [number, number][] = [
    [cx - halfW + 3.2, cz - halfD + 3.5],
    [cx + halfW - 3.2, cz - halfD + 3.5],
    [cx - halfW + 3.2, cz + halfD - 4],
    [cx + halfW - 3.2, cz + halfD - 4],
  ]
  for (const [px, pz] of corners) addPlanter(parent, px, pz, pot, leaf)

  // Side pedestal near west mural (out of main walk path)
  {
    const pedX = cx - halfW + 5.5
    const pedZ = cz + 2
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.95, 1.1, 12),
      wood,
    )
    ped.position.set(pedX, 0.55, pedZ)
    ped.castShadow = true
    parent.add(ped)
    const form = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.45, 0.14, 72, 12),
      brass,
    )
    form.position.set(pedX, 1.7, pedZ)
    form.rotation.x = 0.35
    parent.add(form)
  }
}

/** Hang full career timelines on the north wall — look-only, no modal. */
export function createExperienceExhibits(
  parent: THREE.Object3D,
  experience: CareerPeriod[],
  skillLabels: Record<SkillKey, SkillLabel> | null = null,
) {
  if (!experience.length) return
  const list = sortChronological(experience)
  const panelW = panelWidthForCount(list.length)
  const slots = buildNorthSlots(list.length, panelW)
  list.forEach((period, i) => {
    const slot = slots[i]
    if (!slot) return
    placeCareerBoard(parent, period, slot, i, skillLabels, panelW)
  })
  addExperienceDecor(parent)
}

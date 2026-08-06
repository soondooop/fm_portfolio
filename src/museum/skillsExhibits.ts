import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { AttributeItem, AttributesData } from '../types/portfolio'
import { PROP_SCALE, SKILLS, WALL_T } from './layout'

const GROUPS: { key: keyof AttributesData; title: string; accent: string }[] = [
  { key: 'frontend', title: 'Frontend', accent: '#5eb3c8' },
  { key: 'styling', title: 'Styling', accent: '#ef9a8a' },
  { key: 'designTools', title: 'Design & Tools', accent: '#c4a35a' },
  { key: 'collaboration', title: 'Collaboration', accent: '#7a9e7e' },
  { key: 'delivery', title: 'Delivery', accent: '#8a7ab8' },
  { key: 'developing', title: 'Modern Stack', accent: '#5a8f9a' },
]

const PANEL_W = 2.4 * PROP_SCALE
const PANEL_H = 2.0 * PROP_SCALE
const FRAME_D = 0.1 * PROP_SCALE
const HANG_Y = 2.55 * PROP_SCALE
const PANEL_PITCH = PANEL_W + 1.5 * PROP_SCALE

const CANVAS_W = 768
const CANVAS_H = 640
/** Bar track fills most of the panel; value sits just after it */
const PAD_L = 48
const PAD_R = 36
const VALUE_W = 44
const TRACK_X = PAD_L
const TRACK_W = CANVAS_W - PAD_L - PAD_R - VALUE_W - 12
const VALUE_X = TRACK_X + TRACK_W + 12

interface SkillPanelAnim {
  title: string
  accent: string
  items: AttributeItem[]
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  tex: THREE.CanvasTexture
  mat: THREE.MeshBasicMaterial
}

function drawSkillFrame(
  ctx: CanvasRenderingContext2D,
  title: string,
  accent: string,
) {
  const w = CANVAS_W
  const h = CANVAS_H
  ctx.fillStyle = '#1a1c20'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 4
  ctx.strokeRect(18, 18, w - 36, h - 36)
  ctx.fillStyle = accent
  ctx.fillRect(36, 36, 10, 48)
  ctx.fillStyle = 'rgba(255,244,230,0.95)'
  ctx.font = '700 44px Fraunces, Georgia, serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, 60, 60)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '600 20px DM Sans, Segoe UI, sans-serif'
  ctx.fillText('SKILL SET', 60, 100)
}

function drawSkillBars(
  ctx: CanvasRenderingContext2D,
  items: AttributeItem[],
  accent: string,
) {
  const list = items.slice(0, 7)
  const startY = 138
  const rowH = 68

  list.forEach((item, i) => {
    const rowTop = startY + i * rowH
    const labelY = rowTop + 14
    const barY = rowTop + 38
    const barH = 12

    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = '600 26px DM Sans, Segoe UI, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    let label = item.label
    const noteGap = 12
    const noteText = item.note?.trim() || ''
    ctx.font = noteText
      ? '500 16px DM Sans, Segoe UI, sans-serif'
      : ctx.font
    const noteW = noteText ? ctx.measureText(noteText).width + noteGap : 0
    ctx.font = '600 26px DM Sans, Segoe UI, sans-serif'
    const maxLabel = TRACK_W + VALUE_W - noteW
    if (ctx.measureText(label).width > maxLabel) {
      while (label.length > 1 && ctx.measureText(`${label}…`).width > maxLabel) {
        label = label.slice(0, -1)
      }
      label = `${label}…`
    }
    ctx.fillText(label, PAD_L, labelY)
    const labelW = ctx.measureText(label).width

    if (noteText) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '500 16px DM Sans, Segoe UI, sans-serif'
      ctx.fillText(noteText, PAD_L + labelW + noteGap, labelY)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(TRACK_X, barY, TRACK_W, barH)
    const fillW = Math.max(4, (Math.min(100, item.value) / 100) * TRACK_W)
    ctx.fillStyle = accent
    ctx.fillRect(TRACK_X, barY, fillW, barH)

    ctx.fillStyle = 'rgba(255,244,230,0.92)'
    ctx.font = '700 22px DM Sans, Segoe UI, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(item.value), VALUE_X, barY + barH / 2)
  })
}

function paintPanel(panel: SkillPanelAnim) {
  const { ctx, title, accent, items, tex } = panel
  drawSkillFrame(ctx, title, accent)
  drawSkillBars(ctx, items, accent)
  tex.needsUpdate = true
}

interface Slot {
  x: number
  z: number
  yaw: number
}

function placeAlong(
  count: number,
  from: number,
  to: number,
  make: (along: number) => Slot,
): Slot[] {
  if (count <= 0) return []
  const span = to - from
  const usable = Math.max(0, span - PANEL_W)
  const step =
    count === 1 ? 0 : Math.min(PANEL_PITCH, usable / Math.max(1, count - 1))
  const total = (count - 1) * step
  const start = (from + to) / 2 - total / 2
  const slots: Slot[] = []
  for (let i = 0; i < count; i++) slots.push(make(start + i * step))
  return slots
}

function buildSlots(count: number): Slot[] {
  const { x: cx, z: cz, w, d } = SKILLS
  const inset = WALL_T * 0.75
  const halfW = w / 2
  const halfD = d / 2
  const edge = PANEL_W * 0.55 + 1.2
  const northCap = Math.max(1, Math.floor((w - edge * 2) / PANEL_PITCH) + 1)
  const westCap = Math.max(1, Math.floor((d - edge * 2) / PANEL_PITCH) + 1)
  const doorHalf = 5
  const southWing = halfW - doorHalf - edge
  const southCapEach = Math.max(
    0,
    Math.floor(Math.max(0, southWing * 2 - PANEL_W) / PANEL_PITCH) + 1,
  )

  let northN = Math.min(northCap, Math.ceil(count / 2))
  let westN = Math.min(westCap, count - northN)
  let rem = count - northN - westN
  let southL = 0
  let southR = 0
  while (rem > 0 && southL + southR < southCapEach * 2) {
    if (southL <= southR && southL < southCapEach) {
      southL += 1
      rem -= 1
    } else if (southR < southCapEach) {
      southR += 1
      rem -= 1
    } else if (northN < northCap) {
      northN += 1
      rem -= 1
    } else if (westN < westCap) {
      westN += 1
      rem -= 1
    } else break
  }
  while (rem > 0 && northN < northCap) {
    northN += 1
    rem -= 1
  }

  return [
    ...placeAlong(northN, cx - halfW + edge, cx + halfW - edge, (x) => ({
      x,
      z: cz + halfD - inset,
      yaw: Math.PI,
    })),
    ...placeAlong(westN, cz - halfD + edge, cz + halfD - edge, (z) => ({
      x: cx - halfW + inset,
      z,
      yaw: Math.PI / 2,
    })),
    ...placeAlong(
      southL,
      cx - halfW + edge,
      cx - doorHalf - PANEL_W * 0.5,
      (x) => ({ x, z: cz - halfD + inset, yaw: 0 }),
    ),
    ...placeAlong(
      southR,
      cx + doorHalf + PANEL_W * 0.5,
      cx + halfW - edge,
      (x) => ({ x, z: cz - halfD + inset, yaw: 0 }),
    ),
  ].slice(0, count)
}

export interface SkillsExhibitsHandle {
  root: THREE.Group
  update: (dt: number) => void
  dispose: () => void
}

/** Skill-set boards with a soft pulsing gauge color. */
export function createSkillsExhibits(
  parent: THREE.Object3D,
  attributes: AttributesData | null,
): SkillsExhibitsHandle {
  const root = new THREE.Group()
  root.name = 'skills-exhibits'
  parent.add(root)

  const panels: SkillPanelAnim[] = []
  let time = 0

  if (attributes) {
    const available = GROUPS.filter((g) => (attributes[g.key] || []).length > 0)
    const slots = buildSlots(available.length)

    available.forEach((group, i) => {
      const slot = slots[i]
      if (!slot) return
      const items = attributes[group.key] || []
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_W
      canvas.height = CANVAS_H
      const ctx = canvas.getContext('2d')!
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 2
      const mat = new THREE.MeshBasicMaterial({ map: tex })

      const panel: SkillPanelAnim = {
        title: group.title,
        accent: group.accent,
        items,
        canvas,
        ctx,
        tex,
        mat,
      }
      panels.push(panel)
      paintPanel(panel)

      const pivot = new THREE.Group()
      pivot.position.set(slot.x, HANG_Y, slot.z)
      pivot.rotation.y = slot.yaw
      root.add(pivot)

      const frame = new THREE.Mesh(
        new RoundedBoxGeometry(PANEL_W + 0.2, PANEL_H + 0.2, FRAME_D, 2, 0.05),
        new THREE.MeshStandardMaterial({
          color: '#1c1e22',
          roughness: 0.55,
          metalness: 0.08,
        }),
      )
      frame.castShadow = true
      pivot.add(frame)

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), mat)
      mesh.position.z = FRAME_D * 0.55
      pivot.add(mesh)

      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(
          PANEL_W * 0.55,
          0.08 * PROP_SCALE,
          0.35 * PROP_SCALE,
        ),
        new THREE.MeshStandardMaterial({ color: '#3a2e24', roughness: 0.8 }),
      )
      shelf.position.set(0, -PANEL_H * 0.52, 0.15 * PROP_SCALE)
      pivot.add(shelf)
    })
  }

  return {
    root,
    update(dt) {
      if (!panels.length) return
      time += dt
      // Soft brightness pulse via material tint — no canvas redraw
      const pulse = 0.9 + 0.1 * Math.sin(time * 1.35)
      for (const panel of panels) {
        panel.mat.color.setRGB(pulse, pulse, pulse)
      }
    },
    dispose() {
      panels.forEach((p) => {
        p.tex.dispose()
        p.mat.dispose()
      })
      parent.remove(root)
    },
  }
}

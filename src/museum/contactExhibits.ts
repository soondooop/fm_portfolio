import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { ContactData } from '../types/portfolio'
import {
  CONTACT_DESK,
  CONTACT_GALLERY,
  HALL,
  PROP_SCALE,
} from './layout'

const FRAME_D = 0.12 * PROP_SCALE
const FRAME_PAD = 0.28 * PROP_SCALE
const ACCENT = '#ef9a8a'
const VIEW_DEPTH = 2.5 * PROP_SCALE

export interface ContactLinkHandle {
  id: string
  label: string
  href: string
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  /** World Y band of this link row on the shared board */
  minY: number
  maxY: number
  /** Board plane X (east wall) for look picking */
  planeX: number
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
  if (lines.length === maxLines) {
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

function hungBoard(
  parent: THREE.Object3D,
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  yaw: number,
) {
  const pivot = new THREE.Group()
  pivot.position.set(x, y, z)
  pivot.rotation.y = yaw
  parent.add(pivot)

  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(w + FRAME_PAD, h + FRAME_PAD, FRAME_D, 2, 0.06),
    new THREE.MeshStandardMaterial({
      color: '#1c1e22',
      roughness: 0.55,
      metalness: 0.08,
    }),
  )
  frame.castShadow = true
  pivot.add(frame)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  )
  mesh.position.z = FRAME_D * 0.55
  pivot.add(mesh)

  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.32, 0.12, 0.32),
    new THREE.MeshStandardMaterial({
      color: '#c9b48a',
      roughness: 0.35,
      metalness: 0.45,
      emissive: '#6a5a3a',
      emissiveIntensity: 0.3,
    }),
  )
  lightBar.position.set(0, h * 0.52 + 0.32, 0.18)
  pivot.add(lightBar)
}

function paintHero(contact: ContactData): HTMLCanvasElement {
  const cw = 1400
  const ch = 900
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#16181c'
  ctx.fillRect(0, 0, cw, ch)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 5
  ctx.strokeRect(24, 24, cw - 48, ch - 48)

  ctx.fillStyle = ACCENT
  ctx.fillRect(56, 56, 14, 80)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '600 24px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('CONTACT & HIRE', 88, 72)

  ctx.fillStyle = 'rgba(255,244,230,0.97)'
  ctx.font = '700 64px Fraunces, Georgia, serif'
  ctx.fillText(contact.headline, 88, 140)

  ctx.fillStyle = 'rgba(255,248,238,0.82)'
  ctx.font = '500 28px DM Sans, Segoe UI, sans-serif'
  const subLines = wrapLines(ctx, contact.sub, cw - 180, 4)
  subLines.forEach((line, i) => ctx.fillText(line, 88, 210 + i * 40))

  const mailY = 210 + subLines.length * 40 + 56
  ctx.fillStyle = ACCENT
  ctx.font = '700 36px DM Sans, Segoe UI, sans-serif'
  ctx.fillText(`✉  ${contact.email}`, 88, mailY)

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '600 20px DM Sans, Segoe UI, sans-serif'
  ctx.fillText('TERMS', 88, mailY + 70)

  contact.terms.slice(0, 5).forEach((term, i) => {
    const y = mailY + 110 + i * 52
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(88, y - 22, cw - 200, 44)
    ctx.strokeStyle = `${ACCENT}66`
    ctx.lineWidth = 2
    ctx.strokeRect(88, y - 22, cw - 200, 44)
    ctx.fillStyle = 'rgba(255,248,238,0.9)'
    ctx.font = '600 24px DM Sans, Segoe UI, sans-serif'
    ctx.fillText(term, 108, y)
  })

  return canvas
}

function paintLinks(contact: ContactData): HTMLCanvasElement {
  const cw = 900
  const ch = 700
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#16181c'
  ctx.fillRect(0, 0, cw, ch)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, cw - 40, ch - 40)

  ctx.fillStyle = ACCENT
  ctx.fillRect(48, 48, 12, 64)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '600 22px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('LINKS', 76, 64)

  ctx.fillStyle = 'rgba(255,244,230,0.96)'
  ctx.font = '700 48px Fraunces, Georgia, serif'
  ctx.fillText('찾아보기', 76, 120)

  ctx.fillStyle = 'rgba(94,179,200,0.9)'
  ctx.font = '600 20px DM Sans, Segoe UI, sans-serif'
  ctx.fillText('가까이 가서 E · 링크 열기', 76, 165)

  const items = contact.links.slice(0, 4)
  items.forEach((link, i) => {
    const y = 230 + i * 110
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(64, y - 36, cw - 128, 80)
    ctx.strokeStyle = `${ACCENT}88`
    ctx.lineWidth = 2
    ctx.strokeRect(64, y - 36, cw - 128, 80)
    ctx.fillStyle = 'rgba(255,248,238,0.95)'
    ctx.font = '700 34px DM Sans, Segoe UI, sans-serif'
    ctx.fillText(`▶  ${link.label}`, 92, y - 4)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '500 18px DM Sans, Segoe UI, sans-serif'
    let href = link.href
    if (ctx.measureText(href).width > cw - 200) {
      while (href.length > 1 && ctx.measureText(`${href}…`).width > cw - 200) {
        href = href.slice(0, -1)
      }
      href = `${href}…`
    }
    ctx.fillText(href, 92, y + 28)
  })

  return canvas
}

function paintExitHint(): HTMLCanvasElement {
  const cw = 700
  const ch = 360
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#16181c'
  ctx.fillRect(0, 0, cw, ch)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 4
  ctx.strokeRect(18, 18, cw - 36, ch - 36)

  ctx.fillStyle = '#7a9e7e'
  ctx.fillRect(44, 44, 12, 48)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '600 20px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('EXIT', 72, 58)

  ctx.fillStyle = 'rgba(255,244,230,0.96)'
  ctx.font = '700 36px Fraunces, Georgia, serif'
  ctx.fillText('북쪽으로 나가기', 72, 110)

  ctx.fillStyle = 'rgba(255,248,238,0.8)'
  ctx.font = '500 22px DM Sans, Segoe UI, sans-serif'
  ctx.fillText('북쪽 Exit 문 → Classic / Town', 72, 170)
  ctx.fillText('E · 나가기', 72, 215)

  return canvas
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
}

/** Contact gallery — boards on east wall; Exit on north. Returns link pads. */
export function createContactExhibits(
  parent: THREE.Object3D,
  contact: ContactData | null,
): ContactLinkHandle[] {
  if (!contact) return []

  const { x: cx, z: cz, w, d, wallT } = CONTACT_GALLERY
  const halfW = w / 2
  const halfD = d / 2
  const inset = wallT * 0.55
  const eastX = cx + halfW - inset
  const links: ContactLinkHandle[] = []

  // Shared panel size — 함께 일해요! / 찾아보기
  const panelW = Math.min(14, d * 0.28)
  const panelH = 10
  const panelY = panelH * 0.52 + 0.7

  // Hero (함께 일해요!) — east wall, south of desk
  hungBoard(
    parent,
    paintHero(contact),
    panelW,
    panelH,
    eastX,
    panelY,
    HALL.z - 12,
    -Math.PI / 2,
  )

  // Links (찾아보기) — same size; rows pickable by look
  {
    const items = contact.links.slice(0, 4)
    const boardW = panelW
    const boardH = panelH
    const boardZ = HALL.z + 12
    const boardY = panelY
    hungBoard(
      parent,
      paintLinks(contact),
      boardW,
      boardH,
      eastX,
      boardY,
      boardZ,
      -Math.PI / 2,
    )

    // Canvas layout: header ~0–190px, each row 110px from y=230
    const ch = 700
    const rowTopPx = 230 - 36
    const rowHPx = 110
    items.forEach((link, i) => {
      const y0 = boardY + boardH / 2 - ((rowTopPx + i * rowHPx) / ch) * boardH
      const y1 =
        boardY + boardH / 2 - ((rowTopPx + (i + 1) * rowHPx) / ch) * boardH
      links.push({
        id: `link-${link.label}`,
        label: link.label,
        href: link.href,
        minX: eastX - VIEW_DEPTH,
        maxX: eastX - 0.45,
        minZ: boardZ - boardW / 2,
        maxZ: boardZ + boardW / 2,
        minY: Math.min(y0, y1),
        maxY: Math.max(y0, y1),
        planeX: eastX,
      })
    })
  }

  // Small exit cue on north wall, west of Exit door
  {
    const boardW = 6.5
    const boardH = 4.2
    hungBoard(
      parent,
      paintExitHint(),
      boardW,
      boardH,
      cx - CONTACT_GALLERY.exitDoorW * 0.5 - boardW * 0.55 - 0.8,
      boardH * 0.52 + 0.9,
      cz + halfD - inset,
      Math.PI,
    )
  }

  const pot = new THREE.MeshStandardMaterial({
    color: '#6a5344',
    roughness: 0.88,
  })
  const leaf = new THREE.MeshStandardMaterial({
    color: '#3d6b4a',
    roughness: 0.9,
  })
  const corners: [number, number][] = [
    [cx - halfW + 3, cz - halfD + 3.5],
    [cx + halfW - 3, cz - halfD + 3.5],
    [cx - halfW + 3, cz + halfD - 4],
    [cx + halfW - 3.5, cz + halfD - 4],
  ]
  for (const [px, pz] of corners) addPlanter(parent, px, pz, pot, leaf)

  // Reception desk on east wall (former Exit spot)
  {
    const wood = new THREE.MeshStandardMaterial({
      color: '#3a2e24',
      roughness: 0.8,
    })
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(CONTACT_DESK.w, CONTACT_DESK.h, CONTACT_DESK.d),
      wood,
    )
    desk.position.set(CONTACT_DESK.x, CONTACT_DESK.h / 2, CONTACT_DESK.z)
    desk.castShadow = true
    parent.add(desk)
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(
        CONTACT_DESK.w * 1.06,
        0.08 * PROP_SCALE,
        CONTACT_DESK.d * 1.04,
      ),
      new THREE.MeshStandardMaterial({ color: '#4a3a2e', roughness: 0.7 }),
    )
    top.position.set(
      CONTACT_DESK.x,
      CONTACT_DESK.h + 0.04 * PROP_SCALE,
      CONTACT_DESK.z,
    )
    parent.add(top)
  }

  return links
}

function lookHitY(
  eyeX: number,
  eyeY: number,
  _eyeZ: number,
  yaw: number,
  pitch: number,
  planeX: number,
): number | null {
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(
    new THREE.Euler(pitch, yaw, 0, 'YXZ'),
  )
  if (Math.abs(dir.x) < 1e-4) return null
  const t = (planeX - eyeX) / dir.x
  if (t <= 0.05) return null
  return eyeY + dir.y * t
}

export function nearestContactLink(
  pads: ContactLinkHandle[],
  x: number,
  z: number,
  eyeY: number,
  yaw: number,
  pitch: number,
): ContactLinkHandle | null {
  const here = pads.filter(
    (p) => x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ,
  )
  if (!here.length) return null
  if (here.length === 1) return here[0]

  const planeX = here[0].planeX
  const hitY = lookHitY(x, eyeY, z, yaw, pitch, planeX)
  if (hitY == null) return here[0]

  let best = here[0]
  let bestDist = Infinity
  for (const p of here) {
    const mid = (p.minY + p.maxY) / 2
    const dist =
      hitY >= p.minY && hitY <= p.maxY ? 0 : Math.abs(hitY - mid)
    if (dist < bestDist) {
      bestDist = dist
      best = p
    }
  }
  return best
}

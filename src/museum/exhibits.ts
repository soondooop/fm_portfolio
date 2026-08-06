import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { MatchItem } from '../types/projects'
import { PROJECT_GALLERY, PROP_SCALE } from './layout'

export interface ExhibitHandle {
  key: string
  mesh: THREE.Mesh
  x: number
  z: number
  /** Exclusive viewing pad in front of this painting */
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const loader = new THREE.TextureLoader()

const FRAME_W = 1.55 * PROP_SCALE
const FRAME_H = 1.2 * PROP_SCALE
const FRAME_D = 0.08 * PROP_SCALE
const PANEL_W = 1.35 * PROP_SCALE
const PANEL_H = 1.0 * PROP_SCALE
const PLAQUE_W = 1.25 * PROP_SCALE
const PLAQUE_H = 0.28 * PROP_SCALE

/** How far in front of the wall the player must stand to view */
const VIEW_DEPTH = 2.4 * PROP_SCALE
/** Half-width of the exclusive pad — kept narrow so neighbors never overlap */
const VIEW_HALF = 1.35 * PROP_SCALE

/** CORS proxy for third-party thumbs that block WebGL texture loads */
function proxiedImageUrl(url: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=900&output=jpg`
}

function makeTitleTexture(title: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 384
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 512, 384)
  g.addColorStop(0, '#2a3f4a')
  g.addColorStop(1, '#5eb3c8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 384)
  ctx.fillStyle = 'rgba(255,248,238,0.95)'
  ctx.font = '700 36px DM Sans, Segoe UI, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const words = title.trim().split(/\s+/)
  let line = ''
  const lines: string[] = []
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > 440 && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  const startY = 192 - ((lines.length - 1) * 22)
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 256, startY + i * 44))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function applyPanelTexture(
  mat: THREE.MeshBasicMaterial,
  tex: THREE.Texture,
) {
  tex.colorSpace = THREE.SRGBColorSpace
  mat.map = tex
  mat.color.set('#ffffff')
  mat.needsUpdate = true
}

/** Load project thumb — retry via CORS proxy, then title card fallback. */
function loadPanelImage(
  mat: THREE.MeshBasicMaterial,
  image: string | null,
  title: string,
) {
  if (!image) {
    applyPanelTexture(mat, makeTitleTexture(title))
    return
  }
  loader.load(
    image,
    (tex) => applyPanelTexture(mat, tex),
    undefined,
    () => {
      loader.load(
        proxiedImageUrl(image),
        (tex) => applyPanelTexture(mat, tex),
        undefined,
        () => applyPanelTexture(mat, makeTitleTexture(title)),
      )
    },
  )
}

type WallId = 'south' | 'east' | 'west'

interface HangSlot {
  wall: WallId
  x: number
  z: number
  yaw: number
}

/** Split N items across south / east / west walls (south gets the most). */
function allocateCounts(n: number): { south: number; east: number; west: number } {
  if (n <= 0) return { south: 0, east: 0, west: 0 }
  if (n === 1) return { south: 1, east: 0, west: 0 }
  if (n === 2) return { south: 2, east: 0, west: 0 }
  const south = Math.ceil(n * 0.45)
  const rest = n - south
  const east = Math.ceil(rest / 2)
  const west = rest - east
  return { south, east, west }
}

function buildHangSlots(counts: {
  south: number
  east: number
  west: number
}): HangSlot[] {
  const { x: cx, z: cz, w, d, wallT, margin } = PROJECT_GALLERY
  const halfW = w / 2
  const halfD = d / 2
  const southZ = cz - halfD + wallT * 0.55
  const eastX = cx + halfW - wallT * 0.55
  const westX = cx - halfW + wallT * 0.55
  const slots: HangSlot[] = []

  const placeAlong = (
    count: number,
    wall: WallId,
    from: number,
    to: number,
    fixed: number,
    axis: 'x' | 'z',
    yaw: number,
  ) => {
    if (count <= 0) return
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      const along = from + (to - from) * t
      if (axis === 'x') {
        slots.push({ wall, x: along, z: fixed, yaw })
      } else {
        slots.push({ wall, x: fixed, z: along, yaw })
      }
    }
  }

  // South wall: face +Z (into room). Skip north door side.
  placeAlong(
    counts.south,
    'south',
    cx - halfW + margin,
    cx + halfW - margin,
    southZ,
    'x',
    0,
  )
  // East wall: face -X
  placeAlong(
    counts.east,
    'east',
    cz - halfD + margin,
    cz + halfD - margin,
    eastX,
    'z',
    -Math.PI / 2,
  )
  // West wall: face +X
  placeAlong(
    counts.west,
    'west',
    cz - halfD + margin,
    cz + halfD - margin,
    westX,
    'z',
    Math.PI / 2,
  )

  return slots
}

function viewingPad(slot: HangSlot): {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
} {
  const hx = VIEW_HALF
  if (slot.wall === 'south') {
    return {
      minX: slot.x - hx,
      maxX: slot.x + hx,
      minZ: slot.z + 0.4,
      maxZ: slot.z + VIEW_DEPTH,
    }
  }
  if (slot.wall === 'east') {
    return {
      minX: slot.x - VIEW_DEPTH,
      maxX: slot.x - 0.4,
      minZ: slot.z - hx,
      maxZ: slot.z + hx,
    }
  }
  // west
  return {
    minX: slot.x + 0.4,
    maxX: slot.x + VIEW_DEPTH,
    minZ: slot.z - hx,
    maxZ: slot.z + hx,
  }
}

function placePainting(
  parent: THREE.Object3D,
  project: MatchItem,
  slot: HangSlot,
): ExhibitHandle {
  const y = PROJECT_GALLERY.hangY
  const pivot = new THREE.Group()
  pivot.position.set(slot.x, y, slot.z)
  pivot.rotation.y = slot.yaw
  parent.add(pivot)

  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(FRAME_W, FRAME_H, FRAME_D, 2, 0.04 * PROP_SCALE),
    new THREE.MeshStandardMaterial({
      color: '#1a1a1e',
      roughness: 0.55,
      metalness: 0.08,
    }),
  )
  frame.castShadow = true
  pivot.add(frame)

  const mat = new THREE.MeshBasicMaterial({ color: '#d8e4ef' })
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), mat)
  panel.position.z = FRAME_D * 0.55
  pivot.add(panel)

  loadPanelImage(mat, project.image, project.title)

  const cap = document.createElement('canvas')
  cap.width = 512
  cap.height = 96
  const ctx = cap.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#12161b'
    ctx.fillRect(0, 0, 512, 96)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, 492, 76)

    const maxWidth = 460
    let label = project.title.trim() || 'Untitled'
    ctx.font = '600 34px DM Sans, Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.92)'

    if (ctx.measureText(label).width > maxWidth) {
      while (label.length > 1 && ctx.measureText(`${label}…`).width > maxWidth) {
        label = label.slice(0, -1)
      }
      label = `${label}…`
    }
    ctx.fillText(label, 256, 48)

    const ctex = new THREE.CanvasTexture(cap)
    ctex.colorSpace = THREE.SRGBColorSpace
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(PLAQUE_W, PLAQUE_H),
      new THREE.MeshBasicMaterial({ map: ctex }),
    )
    plaque.position.set(0, -FRAME_H * 0.55, FRAME_D * 0.4)
    pivot.add(plaque)
  }

  const pad = viewingPad(slot)
  return {
    key: project.key,
    mesh: panel,
    x: slot.x,
    z: slot.z,
    ...pad,
  }
}

/**
 * Hang every project as a painting on the walls of the single Projects gallery.
 */
export function createProjectExhibits(
  parent: THREE.Object3D,
  projects: MatchItem[],
): ExhibitHandle[] {
  const list = [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  )
  if (!list.length) return []

  const counts = allocateCounts(list.length)
  const slots = buildHangSlots(counts)
  const handles: ExhibitHandle[] = []

  list.forEach((p, i) => {
    const slot = slots[i]
    if (!slot) return
    handles.push(placePainting(parent, p, slot))
  })

  return handles
}

/** Standing in the exclusive pad in front of a painting. */
export function nearestExhibit(
  exhibits: ExhibitHandle[],
  x: number,
  z: number,
): string | null {
  for (const e of exhibits) {
    if (x >= e.minX && x <= e.maxX && z >= e.minZ && z <= e.maxZ) {
      return e.key
    }
  }
  return null
}

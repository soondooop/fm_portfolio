import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  BUILDING,
  DOOR_H,
  DOORS,
  EXIT_PORTALS,
  FRONT_DESK,
  GRID,
  HALL,
  LOBBY,
  MAP,
  PROP_SCALE,
  ROOMS,
  SKILLS,
  WALL_T,
  type RoomDef,
} from './layout'
import { addHallLobby } from './hallLobby'
import { getMuseumMaterials } from './materials'
import { addOutdoorScenery, outdoorSkyFog } from './scenery'

export interface MuseumWorld {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[]
  dispose: () => void
}

const PALETTE = {
  sky: '#9ec9e8',
  fog: '#a8cbb8',
  desk: '#5a4030',
  plant: '#4a6b4a',
}

function clayMat(color: string, roughness = 0.88) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  })
}

function addBox(
  scene: THREE.Scene,
  colliders: MuseumWorld['colliders'],
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  collide = true,
) {
  const r = Math.min(0.06, w / 3, h / 3, d / 3)
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 2, Math.max(0.02, r)),
    material,
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
  if (collide) {
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
    })
  }
  return mesh
}

function roomFloor(
  scene: THREE.Scene,
  room: RoomDef,
  floorMat: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(room.w - 0.3, room.d - 0.3),
    floorMat,
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(room.x, 0.02, room.z)
  mesh.receiveShadow = true
  scene.add(mesh)
}

function roomCeiling(
  scene: THREE.Scene,
  room: RoomDef,
  ceilingMat: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(room.w - 0.2, room.d - 0.2),
    ceilingMat,
  )
  mesh.rotation.x = Math.PI / 2
  mesh.position.set(room.x, MAP.wallH - 0.05, room.z)
  scene.add(mesh)
}

function roomLabel(scene: THREE.Scene, room: RoomDef) {
  const mounts = plaqueMountsFor(room)
  if (!mounts.length) return

  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 192
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Dark museum plaque
  ctx.fillStyle = '#1c1a17'
  ctx.fillRect(0, 0, 768, 192)
  ctx.strokeStyle = 'rgba(212, 175, 120, 0.7)'
  ctx.lineWidth = 10
  ctx.strokeRect(18, 18, 732, 156)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 3
  ctx.strokeRect(34, 34, 700, 124)
  ctx.fillStyle = 'rgba(255, 244, 230, 0.95)'
  ctx.font = '700 64px "Fraunces", Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(room.label.toUpperCase(), 384, 96)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const wide = room.id === 'projects' || room.id === 'experience'
  const pw = (wide ? 3.6 : 2.6) * PROP_SCALE
  const ph = 0.55 * PROP_SCALE
  const headerMidY = DOOR_H + (MAP.wallH - DOOR_H) * 0.55

  for (const mount of mounts) {
    const group = new THREE.Group()
    group.position.set(mount.x, headerMidY, mount.z)
    group.rotation.y = mount.yaw

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(pw + 0.1, ph + 0.1, 0.07),
      new THREE.MeshStandardMaterial({
        color: '#3a2e24',
        roughness: 0.85,
        metalness: 0.05,
      }),
    )
    board.position.z = -0.04
    group.add(board)

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(pw, ph),
      new THREE.MeshBasicMaterial({ map: tex }),
    )
    face.position.z = 0.01
    group.add(face)

    scene.add(group)
  }
}

/** Nameplates on doorway headers (approach-facing). Skills has hall + lobby sides. */
function plaqueMountsFor(
  room: RoomDef,
): { x: number; z: number; yaw: number }[] {
  const face = WALL_T * 0.55 + 0.04
  switch (room.id) {
    case 'projects':
      return [{ x: HALL.x, z: GRID.midSouth + face, yaw: 0 }]
    case 'experience':
      return [{ x: HALL.x, z: GRID.midNorth - face, yaw: Math.PI }]
    case 'skills':
      return [
        // Hall → Skills
        { x: GRID.westHall + face, z: SKILLS.z, yaw: Math.PI / 2 },
        // Lobby → Skills (right from entrance)
        { x: LOBBY.x, z: GRID.lobbySkills - face, yaw: Math.PI },
      ]
    case 'contact':
      return [{ x: GRID.eastHall - face, z: HALL.z, yaw: -Math.PI / 2 }]
    default:
      return []
  }
}

function addGalleryLights(
  scene: THREE.Scene,
  room: RoomDef,
  intensity = 0.85,
) {
  const y = MAP.wallH - 0.45
  const hx = room.w * 0.28
  const hz = room.d * 0.28
  const dist = Math.max(room.w, room.d) * 1.6
  const spots: [number, number][] = [
    [-hx, -hz],
    [hx, -hz],
    [-hx, hz],
    [hx, hz],
    [-hx, 0],
    [hx, 0],
  ]
  for (const [ox, oz] of spots) {
    const light = new THREE.PointLight(0xfff4e6, intensity, dist, 1.7)
    light.position.set(room.x + ox, y, room.z + oz)
    scene.add(light)
  }
}

/** Horizontal wall along X — door opening + solid header up to ceiling */
function wallX(
  scene: THREE.Scene,
  colliders: MuseumWorld['colliders'],
  z: number,
  x0: number,
  x1: number,
  doorW: number,
  doorX: number,
  mat: THREE.Material,
  trim: THREE.Material,
) {
  const h = MAP.wallH
  const midY = h / 2
  const t = WALL_T
  const len = x1 - x0
  if (doorW <= 0 || doorW >= len - 1) {
    addBox(scene, colliders, len, h, t, (x0 + x1) / 2, midY, z, mat)
    return
  }
  const left = doorX - doorW / 2 - x0
  const right = x1 - (doorX + doorW / 2)
  if (left > 0.5) {
    addBox(scene, colliders, left, h, t, x0 + left / 2, midY, z, mat)
  }
  if (right > 0.5) {
    addBox(scene, colliders, right, h, t, x1 - right / 2, midY, z, mat)
  }

  const doorH = Math.min(DOOR_H, h * 0.88)
  const headerH = h - doorH
  // Solid wall fill above the doorway (visual only — no xz collider or door is blocked)
  addBox(
    scene,
    colliders,
    doorW + t * 0.15,
    headerH,
    t,
    doorX,
    doorH + headerH / 2,
    z,
    mat,
    false,
  )
  // Thin trim beam at the door head
  addBox(
    scene,
    colliders,
    doorW + t * 0.35,
    t * 0.35,
    t * 1.08,
    doorX,
    doorH + t * 0.12,
    z,
    trim,
    false,
  )
}

/** Vertical wall along Z — door opening + solid header up to ceiling */
function wallZ(
  scene: THREE.Scene,
  colliders: MuseumWorld['colliders'],
  x: number,
  z0: number,
  z1: number,
  doorW: number,
  doorZ: number,
  mat: THREE.Material,
  trim: THREE.Material,
) {
  if (doorW > 0) {
    wallZDoors(scene, colliders, x, z0, z1, [{ z: doorZ, w: doorW }], mat, trim)
    return
  }
  const h = MAP.wallH
  const t = WALL_T
  addBox(scene, colliders, t, h, z1 - z0, x, h / 2, (z0 + z1) / 2, mat)
}

/** Vertical wall with one or more door openings (sorted by z). */
function wallZDoors(
  scene: THREE.Scene,
  colliders: MuseumWorld['colliders'],
  x: number,
  z0: number,
  z1: number,
  doors: { z: number; w: number }[],
  mat: THREE.Material,
  trim: THREE.Material,
) {
  const h = MAP.wallH
  const t = WALL_T
  const doorH = Math.min(DOOR_H, h * 0.88)
  const headerH = h - doorH
  const sorted = [...doors].sort((a, b) => a.z - b.z)

  let cursor = z0
  for (const door of sorted) {
    const d0 = door.z - door.w / 2
    const d1 = door.z + door.w / 2
    const before = d0 - cursor
    if (before > 0.4) {
      addBox(scene, colliders, t, h, before, x, h / 2, cursor + before / 2, mat)
    }
    addBox(
      scene,
      colliders,
      t,
      headerH,
      door.w + t * 0.15,
      x,
      doorH + headerH / 2,
      door.z,
      mat,
      false,
    )
    addBox(
      scene,
      colliders,
      t * 1.08,
      t * 0.35,
      door.w + t * 0.35,
      x,
      doorH + t * 0.12,
      door.z,
      trim,
      false,
    )
    cursor = d1
  }
  const after = z1 - cursor
  if (after > 0.4) {
    addBox(scene, colliders, t, h, after, x, h / 2, cursor + after / 2, mat)
  }
}

function makeDoorPlaque(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1c1a17'
  ctx.fillRect(0, 0, 512, 160)
  ctx.strokeStyle = 'rgba(212, 175, 120, 0.75)'
  ctx.lineWidth = 8
  ctx.strokeRect(14, 14, 484, 132)
  ctx.fillStyle = 'rgba(255, 244, 230, 0.95)'
  ctx.font = '700 48px "Fraunces", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.toUpperCase(), 256, 80)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Decorative exit door on Contact north wall — fills the opening. */
function addExitDoorDressing(
  scene: THREE.Scene,
  portal: (typeof EXIT_PORTALS)[number],
  accent: string,
  trim: THREE.Material,
) {
  const zWall = BUILDING.maxZ
  const x = portal.x
  const doorW = DOORS.exitW
  const doorH = Math.min(DOOR_H, MAP.wallH * 0.88)
  const t = WALL_T
  const inset = 0.06
  const leafH = doorH - inset * 2
  const leafW = doorW * 0.5 - inset * 1.2
  const leafD = 0.14 * PROP_SCALE
  const group = new THREE.Group()
  group.position.set(x, 0, zWall - t * 0.55)

  const leafMat = new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.55,
    metalness: 0.08,
  })

  const makeLeaf = (sign: 1 | -1) => {
    const leaf = new THREE.Mesh(
      new RoundedBoxGeometry(leafW, leafH, leafD, 2, 0.03),
      leafMat,
    )
    leaf.position.set(
      sign * (leafW / 2 + inset * 0.4),
      inset + leafH / 2,
      -leafD * 0.35,
    )
    leaf.rotation.y = sign * 0.06
    leaf.castShadow = true
    group.add(leaf)
  }
  makeLeaf(-1)
  makeLeaf(1)

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.07 * PROP_SCALE, 12, 12),
    new THREE.MeshStandardMaterial({
      color: '#d4af78',
      roughness: 0.35,
      metalness: 0.6,
    }),
  )
  knob.position.set(0, doorH * 0.48, -leafD * 0.9)
  group.add(knob)

  const plaqueW = Math.min(doorW * 0.9, 2.4 * PROP_SCALE)
  const plaqueH = 0.45 * PROP_SCALE
  const headerMidY = doorH + (MAP.wallH - doorH) * 0.45
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(plaqueW + 0.1, plaqueH + 0.08, 0.08),
    trim,
  )
  board.position.set(0, headerMidY, -t * 0.55 - 0.06)
  group.add(board)

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(plaqueW, plaqueH),
    new THREE.MeshBasicMaterial({ map: makeDoorPlaque(portal.label) }),
  )
  face.position.set(0, headerMidY, -t * 0.55 - 0.11)
  face.rotation.y = Math.PI
  group.add(face)

  scene.add(group)
}

export function createMuseumWorld(host: HTMLElement): MuseumWorld {
  const scene = new THREE.Scene()
  const outdoor = outdoorSkyFog()
  scene.background = new THREE.Color(outdoor.sky)
  scene.fog = new THREE.FogExp2(outdoor.fog, outdoor.fogDensity)

  const camera = new THREE.PerspectiveCamera(
    55,
    host.clientWidth / Math.max(1, host.clientHeight),
    0.1,
    outdoor.far,
  )

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(host.clientWidth, host.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.22
  host.appendChild(renderer.domElement)

  const mats = getMuseumMaterials()

  scene.add(new THREE.AmbientLight(0xfff5e6, 0.42))
  const key = new THREE.DirectionalLight(0xfff0d0, 1.05)
  key.position.set(28, 42, 18)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 2
  key.shadow.camera.far = 200
  key.shadow.camera.left = -100
  key.shadow.camera.right = 100
  key.shadow.camera.top = 100
  key.shadow.camera.bottom = -100
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xb8c8e0, 0.32)
  fill.position.set(-20, 18, -10)
  scene.add(fill)

  addOutdoorScenery(scene)

  const colliders: MuseumWorld['colliders'] = []
  const h = MAP.wallH
  const midY = h / 2
  const t = WALL_T
  const { minX, maxX, minZ, maxZ } = BUILDING

  // Plinth under the building
  addBox(
    scene,
    colliders,
    maxX - minX + 1.5,
    0.18,
    maxZ - minZ + 1.5,
    (minX + maxX) / 2,
    0.02,
    (minZ + maxZ) / 2,
    mats.trim,
    false,
  )

  ROOMS.forEach((room) => {
    roomFloor(scene, room, mats.floor)
    roomCeiling(scene, room, mats.ceiling)
    roomLabel(scene, room)
    addGalleryLights(scene, room, room.id === 'projects' ? 1.0 : 0.75)
  })

  // Outer shell — warm stucco
  wallX(scene, colliders, minZ, minX, maxX, 0, 0, mats.wall, mats.trim)
  // North wall: Contact Exit door
  wallX(
    scene,
    colliders,
    maxZ,
    minX,
    maxX,
    DOORS.exitW,
    EXIT_PORTALS[0].x,
    mats.wall,
    mats.trim,
  )
  // East wall: solid (desk / contact boards)
  wallZ(scene, colliders, maxX, minZ, maxZ, 0, 0, mats.wall, mats.trim)
  wallZ(
    scene,
    colliders,
    minX,
    minZ,
    maxZ,
    DOORS.entranceW,
    LOBBY.z,
    mats.wall,
    mats.trim,
  )

  // Interior partitions
  wallX(
    scene,
    colliders,
    GRID.midSouth,
    minX,
    maxX,
    DOORS.hallProjectsW,
    HALL.x,
    mats.wall,
    mats.trim,
  )
  // Experience south wall only (Contact owns the NE corner)
  wallX(
    scene,
    colliders,
    GRID.midNorth,
    minX,
    GRID.eastHall,
    DOORS.hallExperienceW,
    HALL.x,
    mats.wall,
    mats.trim,
  )
  // Single continuous west-hall wall (Skills door only) — no lobby hole / black void
  wallZ(
    scene,
    colliders,
    GRID.westHall,
    GRID.midSouth,
    GRID.midNorth,
    DOORS.skillsHallW,
    SKILLS.z,
    mats.wall,
    mats.trim,
  )
  wallX(
    scene,
    colliders,
    GRID.lobbySkills,
    minX,
    GRID.westHall,
    DOORS.lobbySkillsW,
    LOBBY.x,
    mats.wall,
    mats.trim,
  )
  // Contact west wall — Hall door only (Experience↔Contact is solid)
  wallZ(
    scene,
    colliders,
    GRID.eastHall,
    GRID.midSouth,
    maxZ,
    DOORS.hallContactW,
    HALL.z,
    mats.wall,
    mats.trim,
  )

  // Front desk — dark wood
  addBox(
    scene,
    colliders,
    FRONT_DESK.w,
    FRONT_DESK.h,
    FRONT_DESK.d,
    FRONT_DESK.x,
    FRONT_DESK.h / 2,
    FRONT_DESK.z,
    clayMat(PALETTE.desk, 0.55),
    true,
  )
  addBox(
    scene,
    colliders,
    FRONT_DESK.w * 0.92,
    0.06 * PROP_SCALE,
    FRONT_DESK.d * 0.92,
    FRONT_DESK.x,
    FRONT_DESK.h + 0.03 * PROP_SCALE,
    FRONT_DESK.z,
    mats.wainscot,
    false,
  )

  // Contact exit door
  addExitDoorDressing(scene, EXIT_PORTALS[0], '#5a6e58', mats.trim)

  // Hall — hotel-style lobby (corner lounges, clear cross paths)
  addHallLobby(scene, colliders)

  // Entrance pillars (marble)
  addBox(
    scene,
    colliders,
    t * 1.2,
    h,
    t * 1.2,
    minX,
    midY,
    LOBBY.z - DOORS.entranceW / 2 - t,
    mats.wainscot,
    false,
  )
  addBox(
    scene,
    colliders,
    t * 1.2,
    h,
    t * 1.2,
    minX,
    midY,
    LOBBY.z + DOORS.entranceW / 2 + t,
    mats.wainscot,
    false,
  )

  const onResize = () => {
    const w = host.clientWidth
    const hh = Math.max(1, host.clientHeight)
    camera.aspect = w / hh
    camera.updateProjectionMatrix()
    renderer.setSize(w, hh)
  }
  window.addEventListener('resize', onResize)

  return {
    scene,
    camera,
    renderer,
    colliders,
    dispose: () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement)
      }
    },
  }
}

export function resolveMove(
  colliders: MuseumWorld['colliders'],
  x: number,
  z: number,
  dx: number,
  dz: number,
  radius = 0.88,
): { x: number; z: number } {
  let nx = x + dx
  let nz = z + dz
  nx = Math.max(MAP.minX + 1.2, Math.min(MAP.maxX - 1.2, nx))
  nz = Math.max(MAP.minZ + 1.2, Math.min(MAP.maxZ - 1.2, nz))

  const hits = (px: number, pz: number) =>
    colliders.some(
      (c) =>
        px + radius > c.minX &&
        px - radius < c.maxX &&
        pz + radius > c.minZ &&
        pz - radius < c.maxZ,
    )

  if (!hits(nx, z)) x = nx
  if (!hits(x, nz)) z = nz
  return { x, z }
}

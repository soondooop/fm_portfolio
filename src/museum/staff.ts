import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FRONT_DESK, PROP_SCALE } from './layout'

export interface StaffHandle {
  root: THREE.Group
  x: number
  z: number
  ready: boolean
  alert: THREE.Sprite
  setAlertVisible: (visible: boolean) => void
  updateAlert: (dt: number) => void
}

export const STAFF_MODEL_URL = '/models/staff.glb'
const CHAR_SCALE = PROP_SCALE
const TARGET_HEIGHT = 1.72 * CHAR_SCALE
const ALERT_SIZE = 0.55 * CHAR_SCALE
const ALERT_BASE_Y = 2.15 * CHAR_SCALE

function clay(color: string, roughness = 0.9) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  })
}

function ball(
  parent: THREE.Object3D,
  r: number,
  material: THREE.Material,
  y: number,
  x = 0,
  z = 0,
  sx = 1,
  sy = 1,
  sz = 1,
) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), material)
  mesh.position.set(x, y, z)
  mesh.scale.set(sx, sy, sz)
  mesh.castShadow = true
  parent.add(mesh)
}

function capsule(
  parent: THREE.Object3D,
  radius: number,
  length: number,
  material: THREE.Material,
  y: number,
  x = 0,
  z = 0,
) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 6, 12),
    material,
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  parent.add(mesh)
}

function buildPlaceholder(parent: THREE.Group) {
  const skin = clay('#f2c4ae', 0.88)
  const dress = clay('#ef9a8a', 0.9)
  const apron = clay('#fff6ea', 0.92)
  const hair = clay('#5a3a28', 0.86)
  const shoe = clay('#3d2a24', 0.8)
  const blush = clay('#f4a8a0', 0.9)
  const accent = clay('#5eb3c8', 0.88)

  ball(parent, 0.13, shoe, 0.1, -0.12, 0.04, 1.1, 0.65, 1.25)
  ball(parent, 0.13, shoe, 0.1, 0.12, 0.04, 1.1, 0.65, 1.25)
  capsule(parent, 0.1, 0.22, skin, 0.38, -0.12)
  capsule(parent, 0.1, 0.22, skin, 0.38, 0.12)
  ball(parent, 0.42, dress, 0.78, 0, 0, 1.25, 0.85, 1.15)
  ball(parent, 0.3, dress, 1.2, 0, 0, 1.05, 1.1, 0.9)
  ball(parent, 0.22, apron, 1.12, 0, 0.14, 0.95, 1.0, 0.45)
  capsule(parent, 0.09, 0.18, skin, 1.15, -0.38)
  capsule(parent, 0.09, 0.18, skin, 1.15, 0.38)
  ball(parent, 0.1, skin, 0.92, -0.38)
  ball(parent, 0.1, skin, 0.92, 0.38)
  ball(parent, 0.06, accent, 1.28, 0.18, 0.22)
  ball(parent, 0.34, skin, 1.78)
  ball(parent, 0.32, hair, 1.95, 0, -0.04, 1.1, 0.8, 1.05)
  ball(parent, 0.16, hair, 1.7, -0.28, 0.02, 0.85, 1.2, 0.9)
  ball(parent, 0.16, hair, 1.7, 0.28, 0.02, 0.85, 1.2, 0.9)
  ball(parent, 0.05, clay('#1a1410'), 1.8, -0.1, 0.28)
  ball(parent, 0.05, clay('#1a1410'), 1.8, 0.1, 0.28)
  ball(parent, 0.055, blush, 1.72, -0.2, 0.2, 1, 0.65, 0.45)
  ball(parent, 0.055, blush, 1.72, 0.2, 0.2, 1, 0.65, 0.45)
}

function fitModel(model: THREE.Object3D) {
  const box3 = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box3.getSize(size)
  box3.getCenter(center)

  const scale = TARGET_HEIGHT / Math.max(size.y, 0.001)
  model.scale.setScalar(scale)

  box3.setFromObject(model)
  box3.getCenter(center)
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= box3.min.y

  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
}

function createAlertSprite(): THREE.Sprite {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)

  // Soft circular badge
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, 52, 0, Math.PI * 2)
  ctx.fillStyle = '#ff4d4f'
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 78px system-ui, Segoe UI, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('!', size / 2, size / 2 + 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(ALERT_SIZE, ALERT_SIZE, ALERT_SIZE)
  sprite.position.set(0, ALERT_BASE_Y, 0)
  sprite.visible = true
  sprite.renderOrder = 10
  return sprite
}

export function createStaffNpc(opts?: {
  x?: number
  z?: number
  /** Yaw in radians — default faces lobby visitors */
  yaw?: number
  withAlert?: boolean
}): StaffHandle {
  const root = new THREE.Group()
  const x =
    opts?.x ?? FRONT_DESK.x - 0.15 * CHAR_SCALE
  const z =
    opts?.z ?? FRONT_DESK.z - FRONT_DESK.d / 2 - 0.65 * CHAR_SCALE
  const yaw = opts?.yaw ?? 0
  const withAlert = opts?.withAlert ?? true

  const placeholder = new THREE.Group()
  placeholder.name = 'placeholder'
  buildPlaceholder(placeholder)
  placeholder.scale.setScalar(CHAR_SCALE)
  root.add(placeholder)

  const alert = createAlertSprite()
  alert.visible = withAlert
  root.add(alert)

  root.position.set(x, 0, z)
  root.rotation.y = yaw

  let alertT = 0
  let baseY = ALERT_BASE_Y

  const handle: StaffHandle = {
    root,
    x,
    z,
    ready: false,
    alert,
    setAlertVisible(visible) {
      if (!withAlert) {
        alert.visible = false
        return
      }
      alert.visible = visible
    },
    updateAlert(dt) {
      if (!alert.visible) return
      alertT += dt
      alert.position.y = baseY + Math.sin(alertT * 3.2) * 0.08 * CHAR_SCALE
      const pulse = 1 + Math.sin(alertT * 4.5) * 0.06
      alert.scale.set(ALERT_SIZE * pulse, ALERT_SIZE * pulse, ALERT_SIZE * pulse)
    },
  }

  const loader = new GLTFLoader()
  loader.load(
    STAFF_MODEL_URL,
    (gltf) => {
      const model = gltf.scene
      fitModel(model)
      root.remove(placeholder)
      root.add(model)
      root.add(alert)
      const box = new THREE.Box3().setFromObject(model)
      const h = Math.max(1.6 * CHAR_SCALE, box.max.y - box.min.y)
      baseY = h + 0.35 * CHAR_SCALE
      alert.position.y = baseY
      handle.ready = true
    },
    undefined,
    (err) => {
      console.warn('[museum] staff.glb load failed, using placeholder', err)
      handle.ready = false
    },
  )

  return handle
}

export const STAFF_LINES = [
  '안녕하세요! SOONDOOOP MUSEUM에 오신 것을 환영합니다.',
  '이곳은 포트폴리오를 박물관·미술관처럼 둘러보는 공간이에요.',
  '입구의 대형 전광판에서 Overview(소개)를 먼저 확인해 보세요.',
  'Projects 관에서는 작품에 가까이 가면 E로 상세를 볼 수 있어요.',
  'Experience 관 북쪽 벽에는 경력 타임라인이 크게 펼쳐져 있으니 천천히 걸어 보세요.',
  'Contact 관 동쪽 데스크에서 협업 문의·링크를 확인하고, 북쪽 Exit으로 나갈 수 있어요.',
]

export const CONTACT_STAFF_LINE = '김승도님과 함께 일해요!'

export function isNearStaff(
  staff: StaffHandle,
  x: number,
  z: number,
  maxDist = 3.4 * PROP_SCALE,
): boolean {
  return Math.hypot(staff.x - x, staff.z - z) < maxDist
}

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { PROP_SCALE } from './layout'

export interface MuseumPlayer {
  root: THREE.Group
  x: number
  z: number
  yaw: number
  ready: boolean
  setPose: (x: number, z: number, yaw: number) => void
}

/** Drop a smooth GLB here to replace the procedural avatar */
export const PLAYER_MODEL_URL = '/models/player.glb'
const CHAR_SCALE = PROP_SCALE
const TARGET_HEIGHT = 1.85 * CHAR_SCALE

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
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
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
  return mesh
}

/**
 * Kitschy rounded tuxedo buddy — soft clay / toy proportions.
 * Replaced automatically if /models/player.glb exists.
 */
function buildPlaceholder(parent: THREE.Group) {
  const skin = clay('#f0c9a8', 0.88)
  const suit = clay('#2a2a32', 0.86)
  const shirt = clay('#fff8f0', 0.92)
  const shoe = clay('#1a1a20', 0.75)
  const hair = clay('#1c1c24', 0.85)
  const blush = clay('#f4a8a0', 0.9)
  const flower = clay('#fff6ea', 0.9)
  const leaf = clay('#7dd3a0', 0.88)

  // Chubby shoes
  ball(parent, 0.16, shoe, 0.12, -0.15, 0.06, 1.15, 0.7, 1.35)
  ball(parent, 0.16, shoe, 0.12, 0.15, 0.06, 1.15, 0.7, 1.35)

  // Round legs
  capsule(parent, 0.12, 0.28, suit, 0.42, -0.15)
  capsule(parent, 0.12, 0.28, suit, 0.42, 0.15)

  // Round hips / tummy tuxedo body
  ball(parent, 0.34, suit, 0.88, 0, 0, 1.15, 0.95, 0.9)
  ball(parent, 0.38, suit, 1.22, 0, 0, 1.2, 1.05, 0.95)

  // Soft white shirt peek
  ball(parent, 0.2, shirt, 1.35, 0, 0.12, 0.85, 0.7, 0.55)

  // Round arms
  capsule(parent, 0.1, 0.22, suit, 1.15, -0.42)
  capsule(parent, 0.1, 0.22, suit, 1.15, 0.42)
  ball(parent, 0.11, skin, 0.88, -0.42)
  ball(parent, 0.11, skin, 0.88, 0.42)

  // Bow tie blobs
  ball(parent, 0.08, suit, 1.52, -0.1, 0.22, 1.3, 0.7, 0.55)
  ball(parent, 0.08, suit, 1.52, 0.1, 0.22, 1.3, 0.7, 0.55)
  ball(parent, 0.05, suit, 1.52, 0, 0.24)

  // Big cute head
  ball(parent, 0.36, skin, 1.92)

  // Soft hair mound
  ball(parent, 0.34, hair, 2.12, 0, -0.02, 1.05, 0.75, 1.0)
  ball(parent, 0.18, hair, 2.05, -0.2, 0.05, 0.9, 0.85, 0.95)
  ball(parent, 0.14, hair, 2.18, 0.08, -0.08)

  // Eyes (big kitschy)
  ball(parent, 0.055, clay('#1a1410'), 1.95, -0.11, 0.3)
  ball(parent, 0.055, clay('#1a1410'), 1.95, 0.11, 0.3)
  ball(parent, 0.02, clay('#ffffff'), 1.97, -0.095, 0.34)
  ball(parent, 0.02, clay('#ffffff'), 1.97, 0.125, 0.34)

  // Blush cheeks
  ball(parent, 0.06, blush, 1.86, -0.22, 0.22, 1, 0.7, 0.5)
  ball(parent, 0.06, blush, 1.86, 0.22, 0.22, 1, 0.7, 0.5)

  // Smile
  ball(parent, 0.04, clay('#e08a7a'), 1.78, 0, 0.3, 1.6, 0.45, 0.5)

  // Boutonniere puff
  ball(parent, 0.08, flower, 1.38, 0.28, 0.28)
  ball(parent, 0.05, flower, 1.44, 0.32, 0.3)
  ball(parent, 0.04, leaf, 1.32, 0.26, 0.26)
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
  box3.getSize(size)
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

export function createMuseumPlayer(): MuseumPlayer {
  const root = new THREE.Group()
  const placeholder = new THREE.Group()
  placeholder.name = 'placeholder'
  buildPlaceholder(placeholder)
  placeholder.scale.setScalar(CHAR_SCALE)
  root.add(placeholder)

  const player: MuseumPlayer = {
    root,
    x: 0,
    z: 0,
    yaw: 0,
    ready: false,
    setPose(x, z, yaw) {
      this.x = x
      this.z = z
      this.yaw = yaw
      root.position.set(x, 0, z)
      root.rotation.y = yaw
    },
  }

  const loader = new GLTFLoader()
  loader.load(
    PLAYER_MODEL_URL,
    (gltf) => {
      const model = gltf.scene
      fitModel(model)
      root.remove(placeholder)
      root.add(model)
      player.ready = true
    },
    undefined,
    () => {
      player.ready = false
    },
  )

  return player
}

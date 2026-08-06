import * as THREE from 'three'
import { HALL, MAP, PROP_SCALE } from './layout'

type Collider = { minX: number; maxX: number; minZ: number; maxZ: number }

const BRASS = '#c4a574'
const MARBLE = '#d8d0c4'
const LEAF = '#3a5f42'

function mat(color: string, roughness = 0.82, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function addCollider(
  colliders: Collider[],
  x: number,
  z: number,
  w: number,
  d: number,
) {
  colliders.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
  })
}

function chandelier(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group()
  g.position.set(x, MAP.wallH - 1.8 * PROP_SCALE, z)
  parent.add(g)

  const brass = mat(BRASS, 0.32, 0.7)
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.04 * PROP_SCALE,
      0.04 * PROP_SCALE,
      1.4 * PROP_SCALE,
      8,
    ),
    brass,
  )
  rod.position.y = 0.5 * PROP_SCALE
  g.add(rod)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.85 * PROP_SCALE, 0.05 * PROP_SCALE, 8, 24),
    brass,
  )
  ring.rotation.x = Math.PI / 2
  g.add(ring)

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 * PROP_SCALE, 10, 10),
      new THREE.MeshStandardMaterial({
        color: '#fff4dc',
        emissive: '#ffd89a',
        emissiveIntensity: 0.85,
        roughness: 0.4,
      }),
    )
    bulb.position.set(
      Math.cos(a) * 0.85 * PROP_SCALE,
      -0.15 * PROP_SCALE,
      Math.sin(a) * 0.85 * PROP_SCALE,
    )
    g.add(bulb)
  }

  const light = new THREE.PointLight(0xffe6c4, 1.1, 28, 1.8)
  light.position.set(0, -0.2 * PROP_SCALE, 0)
  light.castShadow = true
  g.add(light)
}

function pedestal(
  parent: THREE.Object3D,
  colliders: Collider[],
  x: number,
  z: number,
) {
  const marble = mat(MARBLE, 0.45, 0.08)
  const brass = mat(BRASS, 0.35, 0.6)
  const leaf = mat(LEAF, 0.88)
  const h = 1.15 * PROP_SCALE

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45 * PROP_SCALE, 0.55 * PROP_SCALE, h, 16),
    marble,
  )
  column.position.set(x, h / 2, z)
  column.castShadow = true
  column.receiveShadow = true
  parent.add(column)

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.52 * PROP_SCALE,
      0.52 * PROP_SCALE,
      0.08 * PROP_SCALE,
      16,
    ),
    brass,
  )
  cap.position.set(x, h + 0.04 * PROP_SCALE, z)
  parent.add(cap)

  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(0.48 * PROP_SCALE, 12, 10),
    leaf,
  )
  foliage.position.set(x, h + 0.55 * PROP_SCALE, z)
  foliage.scale.set(1, 1.25, 1)
  foliage.castShadow = true
  parent.add(foliage)

  addCollider(colliders, x, z, 1.2 * PROP_SCALE, 1.2 * PROP_SCALE)
}

/** Hall: chandelier + central pedestal only. */
export function addHallLobby(scene: THREE.Scene, colliders: Collider[]) {
  const group = new THREE.Group()
  group.name = 'hall-lobby'
  scene.add(group)

  chandelier(group, HALL.x, HALL.z)
  pedestal(group, colliders, HALL.x, HALL.z - 1.2)
}

import * as THREE from 'three'
import { BUILDING } from './layout'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const CX = (BUILDING.minX + BUILDING.maxX) / 2
const CZ = (BUILDING.minZ + BUILDING.maxZ) / 2
const HALF_W = (BUILDING.maxX - BUILDING.minX) / 2
const HALF_D = (BUILDING.maxZ - BUILDING.minZ) / 2
/** Keep props well clear of the building envelope */
const CLEAR = 22

function insideClearZone(x: number, z: number) {
  return (
    x > BUILDING.minX - CLEAR &&
    x < BUILDING.maxX + CLEAR &&
    z > BUILDING.minZ - CLEAR &&
    z < BUILDING.maxZ + CLEAR
  )
}

/** Distant mountains, trees, grass — low-poly ring around the museum. */
export function addOutdoorScenery(scene: THREE.Scene) {
  const rand = mulberry32(42)
  const group = new THREE.Group()
  group.name = 'outdoor-scenery'

  const grassMat = new THREE.MeshStandardMaterial({
    color: '#3d6b45',
    roughness: 0.95,
    metalness: 0,
  })
  const darkGrass = new THREE.MeshStandardMaterial({
    color: '#2f5538',
    roughness: 0.96,
    metalness: 0,
  })
  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#5a3d28',
    roughness: 0.9,
    metalness: 0.02,
  })
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: '#2f7a48', roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: '#3d8f55', roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: '#256b3c', roughness: 0.9 }),
  ]
  const rockMat = new THREE.MeshStandardMaterial({
    color: '#6e7368',
    roughness: 0.92,
    metalness: 0.05,
  })
  const mountainMats = [
    new THREE.MeshStandardMaterial({ color: '#5a7a68', roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: '#4a6b5c', roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: '#6b8574', roughness: 0.94 }),
  ]
  const snowMat = new THREE.MeshStandardMaterial({
    color: '#e8f0ea',
    roughness: 0.85,
  })

  const field = new THREE.Mesh(new THREE.CircleGeometry(220, 64), grassMat)
  field.rotation.x = -Math.PI / 2
  field.position.y = -0.08
  field.receiveShadow = true
  group.add(field)

  const meadow = new THREE.Mesh(new THREE.CircleGeometry(120, 48), darkGrass)
  meadow.rotation.x = -Math.PI / 2
  meadow.position.y = -0.06
  meadow.receiveShadow = true
  group.add(meadow)

  // Mountains on the horizon (far from building)
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2 + rand() * 0.2
    const dist = 145 + rand() * 45
    const x = CX + Math.cos(ang) * dist
    const z = CZ + Math.sin(ang) * dist
    const h = 28 + rand() * 42
    const r = 18 + rand() * 22
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(r, h, 5 + Math.floor(rand() * 3)),
      mountainMats[i % mountainMats.length],
    )
    m.position.set(x, h * 0.35 - 2, z)
    m.rotation.y = rand() * Math.PI
    group.add(m)

    if (h > 48) {
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(r * 0.28, h * 0.18, 5),
        snowMat,
      )
      cap.position.set(x, h * 0.35 - 2 + h * 0.38, z)
      group.add(cap)
    }
  }

  const minRing = Math.max(HALF_W, HALF_D) + CLEAR + 4

  // Trees — only outside clear zone
  let trees = 0
  let attempts = 0
  while (trees < 64 && attempts < 400) {
    attempts += 1
    const ang = rand() * Math.PI * 2
    const dist = minRing + rand() * 75
    const x = CX + Math.cos(ang) * dist + (rand() - 0.5) * 8
    const z = CZ + Math.sin(ang) * dist + (rand() - 0.5) * 8
    if (insideClearZone(x, z)) continue

    const tree = new THREE.Group()
    const scale = 0.7 + rand() * 1.4
    const trunkH = 2.2 * scale
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, trunkH, 6),
      trunkMat,
    )
    trunk.position.y = trunkH / 2
    trunk.castShadow = true
    tree.add(trunk)

    const layers = 2 + Math.floor(rand() * 2)
    const leaf = leafMats[Math.floor(rand() * leafMats.length)]
    for (let L = 0; L < layers; L++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry((1.4 - L * 0.25) * scale, 2.4 * scale, 6),
        leaf,
      )
      cone.position.y = trunkH + L * 1.1 * scale
      cone.castShadow = true
      tree.add(cone)
    }
    tree.position.set(x, 0, z)
    group.add(tree)
    trees += 1
  }

  // Bushes along the outer plinth ring (outside walls)
  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * Math.PI * 2 + rand() * 0.12
    const dist = minRing - 6 + rand() * 5
    const x = CX + Math.cos(ang) * dist
    const z = CZ + Math.sin(ang) * dist
    if (insideClearZone(x, z) && dist < minRing - 2) continue
    // Only place if outside building walls
    if (
      x > BUILDING.minX - 4 &&
      x < BUILDING.maxX + 4 &&
      z > BUILDING.minZ - 4 &&
      z < BUILDING.maxZ + 4
    ) {
      continue
    }
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + rand() * 0.9, 8, 6),
      leafMats[i % leafMats.length],
    )
    bush.position.set(x, 0.55, z)
    bush.scale.y = 0.7 + rand() * 0.4
    bush.castShadow = true
    group.add(bush)
  }

  // Rocks outside clear zone
  let rocks = 0
  attempts = 0
  while (rocks < 20 && attempts < 200) {
    attempts += 1
    const ang = rand() * Math.PI * 2
    const dist = minRing + 5 + rand() * 50
    const x = CX + Math.cos(ang) * dist
    const z = CZ + Math.sin(ang) * dist
    if (insideClearZone(x, z)) continue
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6 + rand() * 1.4, 0),
      rockMat,
    )
    rock.position.set(x, 0.3, z)
    rock.rotation.set(rand(), rand(), rand())
    rock.scale.set(1, 0.55 + rand() * 0.5, 1)
    rock.castShadow = true
    group.add(rock)
    rocks += 1
  }

  scene.add(group)

  const hemi = new THREE.HemisphereLight(0xb8d9ef, 0x3d6b45, 0.45)
  scene.add(hemi)

  return group
}

export function outdoorSkyFog() {
  return {
    sky: '#9ec9e8',
    fog: '#a8cbb8',
    fogDensity: 0.0065,
    far: 320,
  }
}

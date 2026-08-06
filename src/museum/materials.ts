import * as THREE from 'three'

/** Procedural museum finishes inspired by linkwalk / Virtual 3D Museum. */

function seededRand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) + 0x9e3779b9) >>> 0
    return (s >>> 0) / 0xffffffff
  }
}

function canvasTex(
  paint: (ctx: CanvasRenderingContext2D, size: number, rand: () => number) => void,
  size = 1024,
  seed = 1,
) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  paint(ctx, size, seededRand(seed))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

function bumpFromNoise(size: number, seed: number, amp = 36) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const rand = seededRand(seed)
  const img = ctx.createImageData(size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(255, 128 + (rand() - 0.5) * amp))
    d[i] = v
    d[i + 1] = v
    d[i + 2] = v
    d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.NoColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function makeWoodFloorMap(size = 1024) {
  return canvasTex((ctx, s, rand) => {
    ctx.fillStyle = '#6a4a2e'
    ctx.fillRect(0, 0, s, s)
    const plankW = Math.floor(s * 0.13)
    const gap = Math.max(2, Math.floor(s * 0.004))
    for (let x = 0; x < s; x += plankW) {
      const hue = 28 + Math.floor(rand() * 10)
      const sat = 30 + Math.floor(rand() * 12)
      const light = 22 + Math.floor(rand() * 10)
      ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`
      ctx.fillRect(x, 0, plankW - gap, s)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(x + plankW - gap, 0, gap, s)
      const grad = ctx.createLinearGradient(x, 0, x + plankW, 0)
      grad.addColorStop(0, 'rgba(255,255,255,0.06)')
      grad.addColorStop(0.5, 'rgba(255,255,255,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.05)')
      ctx.fillStyle = grad
      ctx.fillRect(x, 0, plankW - gap, s)
    }
    ctx.globalAlpha = 0.18
    ctx.strokeStyle = '#2b1a10'
    ctx.lineWidth = 1
    for (let i = 0; i < s * 0.65; i++) {
      const y = Math.floor(rand() * s)
      const wobble = (rand() - 0.5) * 10
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(s * 0.33, y + wobble, s * 0.66, y - wobble, s, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, size, 0x51f00d)
}

export function makeStuccoWallMap(size = 1024) {
  return canvasTex((ctx, s, rand) => {
    ctx.fillStyle = '#d3c1a5'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 520; i++) {
      const x = rand() * s
      const y = rand() * s
      const r = (0.02 + rand() * 0.1) * s
      const a = 0.03 + rand() * 0.06
      const hue = 30 + rand() * 14
      const sat = 24 + rand() * 10
      const light = 74 + (rand() - 0.5) * 10
      ctx.fillStyle = `hsla(${hue} ${sat}% ${light}% / ${a})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 0.09
    ctx.strokeStyle = '#bfa889'
    ctx.lineWidth = Math.max(2, Math.floor(s * 0.006))
    for (let i = 0; i < 90; i++) {
      ctx.beginPath()
      ctx.ellipse(
        rand() * s,
        rand() * s,
        (0.1 + rand() * 0.25) * s,
        (0.04 + rand() * 0.12) * s,
        rand() * Math.PI,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, size, 0x57acc0)
}

export function makeCeilingMap(size = 1024) {
  return canvasTex((ctx, s, rand) => {
    ctx.fillStyle = '#e7e8ea'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 400; i++) {
      const a = 0.02 + rand() * 0.05
      const g = 220 + Math.floor((rand() - 0.5) * 20)
      ctx.fillStyle = `rgba(${g},${g},${g + 2},${a})`
      ctx.beginPath()
      ctx.arc(rand() * s, rand() * s, (0.02 + rand() * 0.1) * s, 0, Math.PI * 2)
      ctx.fill()
    }
  }, size, 0xc3111ce)
}

export function makeGalleryMarbleMap(size = 1024) {
  return canvasTex((ctx, s, rand) => {
    ctx.fillStyle = '#d8d8dc'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 300; i++) {
      const g = 206 + Math.floor((rand() - 0.5) * 28)
      ctx.fillStyle = `rgba(${g},${g},${g},${0.02 + rand() * 0.05})`
      ctx.beginPath()
      ctx.arc(rand() * s, rand() * s, (0.02 + rand() * 0.12) * s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = 'rgba(110,110,118,0.55)'
    ctx.lineWidth = Math.max(1, Math.floor(s * 0.004))
    for (let i = 0; i < 16; i++) {
      const y0 = rand() * s
      const wobble = (rand() - 0.5) * s * 0.22
      ctx.beginPath()
      ctx.moveTo(-s * 0.1, y0)
      ctx.bezierCurveTo(s * 0.25, y0 + wobble, s * 0.55, y0 - wobble, s * 1.1, y0)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, size, 0x6d617262)
}

let cache: {
  floor: THREE.MeshStandardMaterial
  wall: THREE.MeshStandardMaterial
  ceiling: THREE.MeshStandardMaterial
  trim: THREE.MeshStandardMaterial
  wainscot: THREE.MeshStandardMaterial
} | null = null

export function getMuseumMaterials() {
  if (cache) return cache

  const floorMap = makeWoodFloorMap()
  floorMap.repeat.set(8, 8)
  const floorBump = bumpFromNoise(512, 0x51f00d, 22)
  floorBump.repeat.copy(floorMap.repeat)

  const wallMap = makeStuccoWallMap()
  wallMap.repeat.set(4, 2)
  const wallBump = bumpFromNoise(512, 0x57acc0, 40)
  wallBump.repeat.copy(wallMap.repeat)

  const ceilMap = makeCeilingMap()
  ceilMap.repeat.set(5, 5)

  const marbleMap = makeGalleryMarbleMap()
  marbleMap.repeat.set(2, 2)
  const marbleBump = bumpFromNoise(512, 0x70616e6c, 30)
  marbleBump.repeat.copy(marbleMap.repeat)

  cache = {
    floor: new THREE.MeshStandardMaterial({
      color: 0xc4a57a,
      map: floorMap,
      bumpMap: floorBump,
      bumpScale: 0.04,
      roughness: 0.45,
      metalness: 0,
    }),
    wall: new THREE.MeshStandardMaterial({
      color: 0xe8dcc8,
      map: wallMap,
      bumpMap: wallBump,
      bumpScale: 0.035,
      roughness: 0.82,
      metalness: 0,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: 0xeef0f2,
      map: ceilMap,
      roughness: 0.9,
      metalness: 0,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      roughness: 0.55,
      metalness: 0.05,
    }),
    wainscot: new THREE.MeshStandardMaterial({
      color: 0xd0d0d6,
      map: marbleMap,
      bumpMap: marbleBump,
      bumpScale: 0.04,
      roughness: 0.35,
      metalness: 0.04,
    }),
  }
  return cache
}

/** @deprecated use getMuseumMaterials().wall */
export function marbleMaterial(_tone?: string) {
  return getMuseumMaterials().wall
}

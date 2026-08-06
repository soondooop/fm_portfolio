import Phaser from 'phaser'
import type { PlaySection } from './events'

/** Gold-style shapes, portfolio (FM) color system */
const C = {
  grassA: 0x152238,
  grassB: 0x121c32,
  grassDot: 0x1a2d48,
  path: 0x1e3350,
  pathDark: 0x152238,
  pathLight: 0x2a4060,
  water: 0x1a4a7a,
  waterLite: 0x6eb0ff,
  fence: 0x2a3f5c,
  fenceLite: 0x3d5a80,
  treeDark: 0x1a3a48,
  treeMid: 0x2a5a68,
  treeLite: 0x3d7a88,
  trunk: 0x3d4a5c,
  trunkLite: 0x5a6a80,
  roof: 0x3d7fd4,
  roofDark: 0x2a5a9a,
  wall: 0x1a2d48,
  wallShade: 0x152238,
  window: 0x6eb0ff,
  door: 0x0a101c,
  black: 0x0a101c,
  skin: 0xe8c4a0,
  hair: 0x2c1810,
  shirt: 0x6eb0ff,
  pants: 0x1a2d48,
  shoe: 0x0a101c,
}

function fill(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
) {
  g.fillStyle(color, 1)
  g.fillRect(x, y, w, h)
}

function px(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number,
) {
  fill(g, x, y, 1, 1, color)
}

function bake(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
) {
  const g = scene.make.graphics({ x: 0, y: 0 })
  draw(g)
  g.generateTexture(key, w, h)
  g.destroy()
}

export function generatePlayTextures(scene: Phaser.Scene) {
  genGrass(scene)
  genPath(scene)
  genWater(scene)
  genFence(scene)
  genTree(scene)
  genBush(scene)
  genLamp(scene)
  genFlower(scene)
  genFountain(scene)
  genSign(scene)
  genArcade(scene)
  genGate(scene)
  genBooth(scene)
  genBench(scene)
  genSmoke(scene)
  genBird(scene)
  genPlayerSheet(scene)
  genNpcSheet(scene, 'npc-guide', 0xf0c36a, 0x1a2d48)
  genNpcSheet(scene, 'npc-joker', 0xef7b6a, 0x2a1a28)
  genNpcSheet(scene, 'npc-scout', 0x7dd3a0, 0x1a2d28)
  genCat(scene)
  ;(
    [
      'overview',
      'experience',
      'skills',
      'projects',
      'contact',
    ] as PlaySection[]
  ).forEach((id) => genBuilding(scene, id))
}

function genGrass(scene: Phaser.Scene) {
  bake(scene, 'grass', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.grassA)
    px(g, 2, 3, C.grassDot)
    px(g, 9, 7, C.grassDot)
    px(g, 5, 12, C.grassB)
    px(g, 13, 2, C.grassB)
    px(g, 11, 14, C.grassDot)
  })
  bake(scene, 'grass-dark', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.grassB)
    px(g, 4, 5, C.grassA)
    px(g, 12, 10, C.grassA)
    px(g, 7, 14, 0x0a101c)
  })
}

function genPath(scene: Phaser.Scene) {
  bake(scene, 'path', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.path)
    px(g, 3, 4, C.pathDark)
    px(g, 10, 8, C.pathDark)
    px(g, 6, 13, C.pathLight)
    px(g, 14, 2, C.pathLight)
    px(g, 1, 11, C.pathDark)
  })
}

function genWater(scene: Phaser.Scene) {
  bake(scene, 'water', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.water)
    fill(g, 2, 4, 5, 2, C.waterLite)
    fill(g, 9, 10, 5, 2, C.waterLite)
  })
  bake(scene, 'water-2', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.water)
    fill(g, 5, 3, 5, 2, C.waterLite)
    fill(g, 3, 11, 6, 2, C.waterLite)
    px(g, 12, 7, 0x8ec5ff)
  })
}

function genFence(scene: Phaser.Scene) {
  bake(scene, 'fence', 16, 16, (g) => {
    fill(g, 0, 0, 16, 16, C.grassA)
    fill(g, 0, 5, 16, 3, C.fence)
    fill(g, 0, 10, 16, 3, C.fence)
    fill(g, 2, 3, 3, 11, C.fenceLite)
    fill(g, 11, 3, 3, 11, C.fenceLite)
  })
}

function genTree(scene: Phaser.Scene) {
  // Classic Gold-style round canopy tree
  bake(scene, 'tree', 32, 40, (g) => {
    fill(g, 13, 28, 6, 12, C.trunk)
    fill(g, 14, 28, 2, 12, C.trunkLite)
    fill(g, 4, 14, 24, 16, C.treeDark)
    fill(g, 6, 8, 20, 14, C.treeMid)
    fill(g, 10, 4, 12, 10, C.treeLite)
    fill(g, 12, 6, 4, 3, 0x78d060)
  })
}

function genBush(scene: Phaser.Scene) {
  bake(scene, 'bush', 24, 16, (g) => {
    fill(g, 2, 6, 20, 10, C.treeDark)
    fill(g, 4, 2, 16, 10, C.treeMid)
    fill(g, 8, 4, 4, 3, C.treeLite)
  })
}

function genLamp(scene: Phaser.Scene) {
  bake(scene, 'lamp', 12, 28, (g) => {
    fill(g, 5, 10, 2, 18, 0x2a3f5c)
    fill(g, 2, 2, 8, 9, 0xf0c36a)
    fill(g, 3, 3, 6, 7, 0xffe08a)
    fill(g, 3, 0, 6, 3, 0x0a101c)
  })
}

function genFlower(scene: Phaser.Scene) {
  bake(scene, 'flower', 12, 12, (g) => {
    fill(g, 5, 6, 2, 5, 0x2a5a68)
    fill(g, 3, 2, 6, 6, 0xef7b6a)
    fill(g, 4, 3, 4, 4, 0xf0c36a)
    px(g, 5, 4, 0xe6eef8)
  })
}

function genFountain(scene: Phaser.Scene) {
  bake(scene, 'fountain', 48, 40, (g) => {
    fill(g, 4, 24, 40, 12, 0x2a3f5c)
    fill(g, 8, 20, 32, 8, 0x3d5a80)
    fill(g, 12, 10, 24, 16, C.water)
    fill(g, 16, 14, 16, 8, C.waterLite)
    fill(g, 21, 4, 6, 12, 0x2a3f5c)
    fill(g, 22, 2, 4, 4, 0x8ec5ff)
  })
}

function genSign(scene: Phaser.Scene) {
  bake(scene, 'sign', 28, 36, (g) => {
    fill(g, 12, 18, 4, 18, 0x3d4a5c)
    fill(g, 2, 2, 24, 18, 0x1a2d48)
    fill(g, 4, 4, 20, 14, 0x6eb0ff)
    fill(g, 6, 6, 16, 3, 0x0a101c)
    fill(g, 6, 11, 12, 3, 0x0a101c)
  })
}

function genArcade(scene: Phaser.Scene) {
  bake(scene, 'arcade', 32, 40, (g) => {
    fill(g, 4, 8, 24, 30, 0x1a2d48)
    fill(g, 6, 10, 20, 14, 0x0a101c)
    fill(g, 8, 12, 16, 10, 0x6eb0ff)
    fill(g, 10, 14, 4, 3, 0xef7b6a)
    fill(g, 16, 14, 6, 2, 0xf0c36a)
    fill(g, 10, 18, 12, 2, 0x7dd3a0)
    fill(g, 8, 26, 16, 4, 0x2a3f5c)
    fill(g, 12, 27, 8, 2, 0x8ec5ff)
    fill(g, 6, 32, 20, 6, 0x152238)
    px(g, 14, 34, 0xf0c36a)
    px(g, 18, 34, 0xef7b6a)
  })
}

function genGate(scene: Phaser.Scene) {
  bake(scene, 'gate', 72, 56, (g) => {
    fill(g, 4, 20, 10, 36, 0x2a3f5c)
    fill(g, 58, 20, 10, 36, 0x2a3f5c)
    fill(g, 2, 8, 68, 16, 0x5a9e7a)
    fill(g, 6, 4, 60, 10, 0x7dd3a0)
    fill(g, 14, 24, 44, 28, 0x0a101c)
    fill(g, 18, 28, 36, 4, 0xf0c36a)
    fill(g, 22, 36, 28, 3, 0x8ec5ff)
  })
}

function genBooth(scene: Phaser.Scene) {
  bake(scene, 'booth', 56, 64, (g) => {
    fill(g, 6, 28, 44, 32, C.wall)
    fill(g, 6, 52, 44, 8, C.wallShade)
    fill(g, 2, 18, 52, 14, 0x5a9e7a)
    fill(g, 8, 10, 40, 12, 0x7dd3a0)
    fill(g, 2, 18, 52, 3, 0x3d6a50)
    // signboard frame
    fill(g, 10, 30, 36, 22, 0x0a101c)
    fill(g, 12, 32, 32, 18, 0x1a2d48)
    fill(g, 22, 40, 12, 12, C.door)
    px(g, 30, 46, 0xf0c36a)
  })
}

function genBench(scene: Phaser.Scene) {
  bake(scene, 'bench', 40, 20, (g) => {
    fill(g, 2, 8, 36, 6, 0x3d4a5c)
    fill(g, 4, 6, 32, 4, 0x5a6a80)
    fill(g, 4, 14, 4, 6, 0x2a3f5c)
    fill(g, 32, 14, 4, 6, 0x2a3f5c)
  })
}

function genSmoke(scene: Phaser.Scene) {
  bake(scene, 'smoke', 10, 10, (g) => {
    fill(g, 2, 2, 6, 6, 0x8ec5ff)
    fill(g, 3, 3, 4, 4, 0xe6eef8)
  })
}

function genBird(scene: Phaser.Scene) {
  bake(scene, 'bird', 10, 6, (g) => {
    fill(g, 1, 2, 3, 2, 0x8ec5ff)
    fill(g, 4, 1, 2, 3, 0xe6eef8)
    fill(g, 6, 2, 3, 2, 0x8ec5ff)
  })
}

function genNpcSheet(
  scene: Phaser.Scene,
  key: string,
  shirt: number,
  pants: number,
) {
  const frameW = 16
  const frameH = 24
  bake(scene, key, frameW * 2, frameH, (g) => {
    drawNpcFrame(g, 0, 0, 0, shirt, pants)
    drawNpcFrame(g, frameW, 0, 1, shirt, pants)
  })
  const texture = scene.textures.get(key)
  for (let i = 0; i < 2; i++) {
    if (!texture.has(String(i))) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH)
    }
  }
}

function drawNpcFrame(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
  frame: number,
  shirt: number,
  pants: number,
) {
  const step = frame === 0 ? 0 : 1
  fill(g, ox + 4, oy + 22, 8, 2, 0x000000)
  fill(g, ox + 5, oy + 17, 3, 5 + step, pants)
  fill(g, ox + 8, oy + 17, 3, 5 - step, pants)
  fill(g, ox + 5, oy + 21 + step, 3, 2, C.shoe)
  fill(g, ox + 8, oy + 21 - step, 3, 2, C.shoe)
  fill(g, ox + 4, oy + 10, 8, 7, shirt)
  fill(g, ox + 4, oy + 3, 8, 8, C.skin)
  fill(g, ox + 3, oy + 1, 10, 5, C.hair)
  px(g, ox + 6, oy + 7, C.black)
  px(g, ox + 9, oy + 7, C.black)
  fill(g, ox + 2, oy + 12, 2, 5, C.skin)
  fill(g, ox + 12, oy + 12, 2, 5, C.skin)
}

function genCat(scene: Phaser.Scene) {
  const frameW = 16
  const frameH = 14
  bake(scene, 'npc-cat', frameW * 2, frameH, (g) => {
    drawCat(g, 0, 0, 0)
    drawCat(g, frameW, 0, 1)
  })
  const texture = scene.textures.get('npc-cat')
  for (let i = 0; i < 2; i++) {
    if (!texture.has(String(i))) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH)
    }
  }
}

function drawCat(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
  frame: number,
) {
  const body = 0x93a4bc
  const ear = frame === 0 ? 0 : 1
  fill(g, ox + 3, oy + 6, 10, 6, body)
  fill(g, ox + 4, oy + 3, 8, 6, body)
  fill(g, ox + 4, oy + 1 + ear, 3, 3, body)
  fill(g, ox + 9, oy + 1, 3, 3, body)
  px(g, ox + 6, oy + 5, C.black)
  px(g, ox + 9, oy + 5, C.black)
  fill(g, ox + 12, oy + 8, 3, 2, 0xef7b6a)
}

const HOUSE: Record<
  PlaySection,
  { roof: number; accent: number }
> = {
  overview: { roof: 0x6eb0ff, accent: 0x8ec5ff },
  experience: { roof: 0x3d7fd4, accent: 0x6eb0ff },
  skills: { roof: 0xf0c36a, accent: 0xffd88a },
  projects: { roof: 0x5a9e7a, accent: 0x7dd3a0 },
  contact: { roof: 0xef7b6a, accent: 0xffa090 },
}

function genBuilding(scene: Phaser.Scene, id: PlaySection) {
  const { roof, accent } = HOUSE[id]
  // Pokémon Gold town house silhouette + portfolio colors
  bake(scene, `building-${id}`, 64, 64, (g) => {
    fill(g, 8, 28, 48, 32, C.wall)
    fill(g, 8, 52, 48, 8, C.wallShade)
    fill(g, 4, 20, 56, 12, roof)
    fill(g, 10, 12, 44, 12, roof)
    fill(g, 16, 6, 32, 10, roof)
    fill(g, 4, 20, 56, 3, C.roofDark)
    // chimney
    fill(g, 44, 2, 8, 14, 0x2a3f5c)
    fill(g, 45, 1, 6, 3, 0x3d5a80)
    fill(g, 26, 34, 12, 18, C.door)
    fill(g, 28, 36, 4, 5, 0x152238)
    px(g, 34, 46, 0xf0c36a)
    fill(g, 12, 34, 10, 10, accent)
    fill(g, 42, 34, 10, 10, accent)
    fill(g, 14, 36, 3, 3, 0xe6eef8)
    fill(g, 44, 36, 3, 3, 0xe6eef8)
    fill(g, 18, 24, 28, 6, C.black)
    fill(g, 19, 25, 26, 4, accent)
  })
}

function genPlayerSheet(scene: Phaser.Scene) {
  const frameW = 16
  const frameH = 24
  bake(scene, 'player-sheet', frameW * 8, frameH, (g) => {
    let i = 0
    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 2; frame++) {
        drawGoldTrainer(g, i * frameW, 0, dir, frame)
        i++
      }
    }
  })

  const texture = scene.textures.get('player-sheet')
  for (let i = 0; i < 8; i++) {
    if (!texture.has(String(i))) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH)
    }
  }
}

export function createPlayerAnims(scene: Phaser.Scene) {
  if (scene.anims.exists('walk-down')) return
  const mk = (key: string, a: number, b: number) =>
    scene.anims.create({
      key,
      frames: [
        { key: 'player-sheet', frame: a },
        { key: 'player-sheet', frame: b },
      ],
      frameRate: 7,
      repeat: -1,
    })
  mk('walk-down', 0, 1)
  mk('walk-left', 2, 3)
  mk('walk-right', 4, 5)
  mk('walk-up', 6, 7)
}

/** Compact trainer proportions closer to Gen 2 overworld sprites. */
function drawGoldTrainer(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
  dir: number,
  frame: number,
) {
  const step = frame === 0 ? 0 : 1
  fill(g, ox + 4, oy + 22, 8, 2, 0x000000)

  // legs
  if (dir === 0 || dir === 3) {
    fill(g, ox + 5, oy + 17, 3, 5 + step, C.pants)
    fill(g, ox + 8, oy + 17, 3, 5 - step, C.pants)
    fill(g, ox + 5, oy + 21 + step, 3, 2, C.shoe)
    fill(g, ox + 8, oy + 21 - step, 3, 2, C.shoe)
  } else {
    fill(g, ox + 6, oy + 17, 4, 5, C.pants)
    fill(g, ox + 6 + (frame ? 1 : -1), oy + 21, 4, 2, C.shoe)
  }

  // torso
  fill(g, ox + 4, oy + 10, 8, 7, C.shirt)
  fill(g, ox + 5, oy + 11, 6, 2, 0x8ec5ff)

  // head / hair
  fill(g, ox + 4, oy + 3, 8, 8, C.skin)
  if (dir === 3) {
    fill(g, ox + 3, oy + 2, 10, 9, C.hair)
    fill(g, ox + 4, oy + 9, 8, 2, C.skin)
  } else {
    fill(g, ox + 3, oy + 1, 10, 5, C.hair)
    if (dir === 0) {
      px(g, ox + 6, oy + 7, C.black)
      px(g, ox + 9, oy + 7, C.black)
      fill(g, ox + 6, oy + 9, 4, 1, 0xe8b080)
    } else if (dir === 1) {
      px(g, ox + 5, oy + 7, C.black)
    } else {
      px(g, ox + 10, oy + 7, C.black)
    }
  }

  // arms
  if (dir === 0 || dir === 3) {
    fill(g, ox + 2, oy + 12, 2, 5, C.skin)
    fill(g, ox + 12, oy + 12, 2, 5, C.skin)
  } else if (dir === 1) {
    fill(g, ox + 3, oy + 12 + step, 2, 5, C.skin)
  } else {
    fill(g, ox + 11, oy + 12 + step, 2, 5, C.skin)
  }
}

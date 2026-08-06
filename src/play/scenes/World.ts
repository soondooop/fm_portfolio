import Phaser from 'phaser'
import {
  PLAY_EVENT,
  PLAY_SECTIONS,
  type PlayInputState,
  type PlayMinigame,
  type PlayProjectBooth,
  type PlaySection,
  type PlayTalkPayload,
} from '../events'
import { createPlayerAnims } from '../textures'
import { TOWN_EGGS, TOWN_NPCS, npcTalk, type TownNpc } from '../townContent'

const SPEED = 240
const MAP_W = 1800
const MAP_H = 1520
const TILE = 32
const BOOTH_COLS = 5
const BOOTH_GAP_X = 172
const BOOTH_GAP_Y = 158
const BOOTH_START_X = 160
const BOOTH_START_Y = 800

interface ZoneDef {
  id: PlaySection
  label: string
  x: number
  y: number
}

const ZONES: ZoneDef[] = [
  { id: 'overview', label: 'Overview', x: 300, y: 268 },
  { id: 'experience', label: 'Experience', x: 900, y: 268 },
  { id: 'skills', label: 'Skills', x: 1500, y: 268 },
  { id: 'projects', label: 'Projects Village', x: 480, y: 620 },
  { id: 'contact', label: 'Contact', x: 1320, y: 588 },
]

const BUILDING_POS: { id: PlaySection; x: number; y: number }[] = [
  { id: 'overview', x: 300, y: 200 },
  { id: 'experience', x: 900, y: 200 },
  { id: 'skills', x: 1500, y: 200 },
  { id: 'contact', x: 1320, y: 520 },
]

type NearbyTarget =
  | { kind: 'building'; section: PlaySection; label: string }
  | { kind: 'npc'; npc: TownNpc }
  | {
      kind: 'egg'
      talk: PlayTalkPayload
      label: string
      minigame?: PlayMinigame
      eggId?: string
    }
  | { kind: 'project'; key: string; title: string }

export default class World extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
  private interactKey!: Phaser.Input.Keyboard.Key
  private prompt!: Phaser.GameObjects.Text
  private nearby: NearbyTarget | null = null
  private overlayOpen = false
  private solids!: Phaser.Physics.Arcade.StaticGroup
  private facing: 'down' | 'up' | 'left' | 'right' = 'down'
  private visited = new Set<PlaySection>()
  private npcSprites: { npc: TownNpc; sprite: Phaser.GameObjects.Sprite }[] =
    []
  private lamps: Phaser.GameObjects.Image[] = []
  private rustleCooldown = 0
  private stateCooldown = 0
  private projectBooths: {
    key: string
    title: string
    image: string | null
    x: number
    y: number
  }[] = []
  private waterTiles: Phaser.GameObjects.Image[] = []
  private sitting = false

  constructor() {
    super('World')
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a101c)
    this.physics.world.setBounds(TILE, TILE, MAP_W - TILE * 2, MAP_H - TILE * 2)
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)

    createPlayerAnims(this)
    this.solids = this.physics.add.staticGroup()

    this.paintVillageGround()
    this.placeBorderFence()
    this.placePaths()
    this.placeDecor()
    this.placeBuildings()
    this.placeProjectGate()
    this.placeFountain()
    this.placeEggs()
    this.placeNpcs()
    this.placeBirds()

    this.player = this.physics.add.sprite(
      MAP_W / 2,
      MAP_H / 2 - 120,
      'player-sheet',
      0,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(20)
    this.player.setScale(2)
    this.player.setSize(10, 8)
    this.player.setOffset(3, 14)
    this.physics.add.collider(this.player, this.solids)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setZoom(1.5)

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      }
      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E,
      )
      this.interactKey.on('down', () => this.tryInteract())
    }

    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'NeoDunggeunmo, monospace',
        fontSize: '14px',
        color: '#e6eef8',
        backgroundColor: '#152238',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5, 1)
      .setDepth(40)
      .setVisible(false)

    this.game.events.on(PLAY_EVENT.CLOSE, this.onOverlayClose, this)
    this.game.events.on(PLAY_EVENT.TALK_CLOSE, this.onOverlayClose, this)
    this.game.events.on(PLAY_EVENT.MINIGAME_CLOSE, this.onOverlayClose, this)
    this.game.events.on(PLAY_EVENT.PROJECTS_SYNC, this.onProjectsSync, this)
    this.events.on('shutdown', () => {
      this.game.events.off(PLAY_EVENT.CLOSE, this.onOverlayClose, this)
      this.game.events.off(PLAY_EVENT.TALK_CLOSE, this.onOverlayClose, this)
      this.game.events.off(
        PLAY_EVENT.MINIGAME_CLOSE,
        this.onOverlayClose,
        this,
      )
      this.game.events.off(PLAY_EVENT.PROJECTS_SYNC, this.onProjectsSync, this)
    })

    this.add
      .text(16, 16, 'WASD · E talk/enter', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '8px',
        color: '#e6eef8',
        backgroundColor: '#152238',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(50)

    const cached = this.registry.get('projects') as PlayProjectBooth[] | undefined
    if (cached?.length) this.spawnProjectBooths(cached)

    this.time.addEvent({
      delay: 480,
      loop: true,
      callback: () => this.animateWater(),
    })
  }

  private onProjectsSync(list: PlayProjectBooth[]) {
    this.spawnProjectBooths(list)
  }

  private paintVillageGround() {
    for (let y = 0; y < MAP_H; y += TILE) {
      for (let x = 0; x < MAP_W; x += TILE) {
        const key =
          (x / TILE + y / TILE) % 3 === 0 ? 'grass-dark' : 'grass'
        this.add
          .image(x + TILE / 2, y + TILE / 2, key)
          .setDisplaySize(TILE, TILE)
          .setDepth(0)
      }
    }
  }

  private placeBorderFence() {
    for (let x = 0; x < MAP_W; x += TILE) {
      ;(
        [
          [x + TILE / 2, TILE / 2],
          [x + TILE / 2, MAP_H - TILE / 2],
        ] as const
      ).forEach(([px, py]) => {
        const f = this.solids.create(px, py, 'fence') as Phaser.Physics.Arcade.Image
        f.setDisplaySize(TILE, TILE)
        f.refreshBody()
      })
    }
    for (let y = TILE; y < MAP_H - TILE; y += TILE) {
      ;([TILE / 2, MAP_W - TILE / 2] as const).forEach((px) => {
        const f = this.solids.create(
          px,
          y + TILE / 2,
          'fence',
        ) as Phaser.Physics.Arcade.Image
        f.setDisplaySize(TILE, TILE)
        f.refreshBody()
      })
    }
  }

  private placePaths() {
    const stamped = new Set<string>()
    const stamp = (tx: number, ty: number) => {
      const key = `${tx},${ty}`
      if (stamped.has(key)) return
      stamped.add(key)
      this.add
        .image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'path')
        .setDisplaySize(TILE, TILE)
        .setDepth(1)
    }
    const hLine = (x0: number, x1: number, y: number) => {
      const a = Math.min(x0, x1)
      const b = Math.max(x0, x1)
      for (let x = a; x <= b; x++) stamp(x, y)
    }
    const vLine = (y0: number, y1: number, x: number) => {
      const a = Math.min(y0, y1)
      const b = Math.max(y0, y1)
      for (let y = a; y <= b; y++) stamp(x, y)
    }
    const pad = (x0: number, x1: number, y0: number, y1: number) => {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
        hLine(x0, x1, y)
      }
    }

    hLine(4, 52, 12)
    hLine(4, 52, 13)
    pad(25, 31, 10, 14)

    vLine(8, 13, 8)
    vLine(8, 13, 9)
    pad(7, 10, 8, 9)

    vLine(8, 13, 27)
    vLine(8, 13, 28)
    pad(26, 29, 8, 9)

    vLine(8, 13, 46)
    vLine(8, 13, 47)
    pad(45, 48, 8, 9)

    // to projects gate + village
    vLine(13, 28, 14)
    vLine(13, 28, 15)
    pad(13, 16, 18, 19)
    pad(12, 17, 19, 20)

    vLine(13, 19, 40)
    vLine(13, 19, 41)
    pad(39, 42, 18, 19)

    hLine(14, 41, 16)
    hLine(14, 41, 17)

    // village grid roads
    hLine(4, 52, 24)
    hLine(4, 52, 25)
    hLine(4, 52, 30)
    hLine(4, 52, 31)
    hLine(4, 52, 35)
    hLine(4, 52, 36)
    hLine(4, 52, 40)
    hLine(4, 52, 41)
    ;[5, 6, 16, 17, 27, 28, 38, 39, 49, 50].forEach((x) => {
      vLine(24, 44, x)
    })

    vLine(13, 16, 6)
    vLine(13, 16, 7)
    pad(5, 8, 15, 16)
    hLine(7, 14, 16)

    vLine(4, 12, 51)
    vLine(4, 12, 52)
    pad(50, 53, 4, 5)
    hLine(47, 52, 5)
  }

  private placeDecor() {
    const treeSpots = [
      [90, 90],
      [170, 120],
      [250, 80],
      [620, 100],
      [780, 90],
      [1050, 110],
      [1200, 80],
      [1400, 100],
      [1650, 90],
      [100, 1400],
      [220, 1450],
      [700, 1420],
      [980, 1460],
      [1600, 1400],
      [1720, 1450],
      [100, 700],
      [1600, 700],
    ]
    treeSpots.forEach(([x, y]) => {
      this.add
        .image(x, y, 'tree')
        .setDisplaySize(56, 70)
        .setDepth(5 + (y / MAP_H) * 10)
      const block = this.solids.create(
        x,
        y + 20,
        'bush',
      ) as Phaser.Physics.Arcade.Image
      block.setVisible(false)
      block.body!.setSize(18, 14)
      block.refreshBody()
    })

    ;[
      [360, 340],
      [540, 350],
      [1100, 340],
      [1280, 360],
      [860, 1000],
      [1100, 1040],
    ].forEach(([x, y]) => {
      this.add.image(x, y, 'bush').setDisplaySize(40, 28).setDepth(4)
      const block = this.solids.create(
        x,
        y + 4,
        'bush',
      ) as Phaser.Physics.Arcade.Image
      block.setVisible(false)
      block.refreshBody()
    })

    ;[
      [480, 380],
      [820, 380],
      [980, 380],
      [1320, 380],
      [600, 500],
      [1200, 500],
      [400, 900],
      [900, 900],
    ].forEach(([x, y], i) => {
      const lamp = this.add
        .image(x, y, 'lamp')
        .setDisplaySize(18, 42)
        .setDepth(6)
      this.lamps.push(lamp)
      this.tweens.add({
        targets: lamp,
        alpha: { from: 0.72, to: 1 },
        duration: 700 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })

    ;[
      [340, 320],
      [380, 330],
      [860, 310],
      [940, 330],
      [1460, 320],
      [1540, 340],
      [500, 620],
      [1360, 620],
      [300, 860],
      [700, 860],
    ].forEach(([x, y]) => {
      this.add.image(x, y, 'flower').setDisplaySize(18, 18).setDepth(3)
    })

    for (let ty = 20; ty <= 22; ty++) {
      for (let tx = 24; tx <= 27; tx++) {
        const tile = this.add
          .image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'water')
          .setDisplaySize(TILE, TILE)
          .setDepth(2)
        this.waterTiles.push(tile)
        const block = this.solids.create(
          tx * TILE + TILE / 2,
          ty * TILE + TILE / 2,
          'water',
        ) as Phaser.Physics.Arcade.Image
        block.setVisible(false)
        block.setDisplaySize(TILE, TILE)
        block.refreshBody()
      }
    }
  }

  private animateWater() {
    this.waterTiles.forEach((tile, i) => {
      tile.setTexture(i % 2 === Math.floor(this.time.now / 480) % 2 ? 'water-2' : 'water')
    })
  }

  private placeBuildings() {
    BUILDING_POS.forEach((b) => {
      const building = this.add
        .image(b.x, b.y, `building-${b.id}`)
        .setDisplaySize(96, 96)
        .setDepth(8)
        .setInteractive({ useHandCursor: true })

      building.on('pointerdown', () => {
        this.nearby = {
          kind: 'building',
          section: b.id,
          label: PLAY_SECTIONS.find((s) => s.id === b.id)?.label ?? b.id,
        }
        this.tryInteract()
      })

      const body = this.solids.create(
        b.x,
        b.y + 22,
        'bush',
      ) as Phaser.Physics.Arcade.Image
      body.setVisible(false)
      body.body!.setSize(72, 42)
      body.refreshBody()

      this.spawnChimneySmoke(b.x + 28, b.y - 40)

      const label = PLAY_SECTIONS.find((s) => s.id === b.id)?.label ?? b.id
      this.add
        .text(b.x, b.y + 58, label, {
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '8px',
          color: '#e6eef8',
          backgroundColor: '#152238',
          padding: { x: 4, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(9)
    })
  }

  private placeProjectGate() {
    const gx = 480
    const gy = 560
    const gate = this.add
      .image(gx, gy, 'gate')
      .setDisplaySize(120, 90)
      .setDepth(8)
      .setInteractive({ useHandCursor: true })
    gate.on('pointerdown', () => {
      this.nearby = {
        kind: 'building',
        section: 'projects',
        label: 'Projects Village',
      }
      this.tryInteract()
    })
    ;[-42, 42].forEach((dx) => {
      const post = this.solids.create(
        gx + dx,
        gy + 18,
        'bush',
      ) as Phaser.Physics.Arcade.Image
      post.setVisible(false)
      post.body!.setSize(18, 36)
      post.refreshBody()
    })
    this.add
      .text(gx, gy + 52, 'PROJECTS VILLAGE', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '8px',
        color: '#7dd3a0',
        backgroundColor: '#152238',
        padding: { x: 4, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(9)
  }

  private spawnProjectBooths(list: PlayProjectBooth[]) {
    if (this.projectBooths.length) return
    const picks = list
    const cols = BOOTH_COLS
    const startX = BOOTH_START_X
    const startY = BOOTH_START_Y
    const gapX = BOOTH_GAP_X
    const gapY = BOOTH_GAP_Y

    picks.forEach((p, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * gapX
      const y = startY + row * gapY
      this.projectBooths.push({
        key: p.key,
        title: p.title,
        image: p.image,
        x,
        y,
      })

      const booth = this.add
        .image(x, y, 'booth')
        .setDisplaySize(88, 100)
        .setDepth(8)
        .setInteractive({ useHandCursor: true })
      booth.on('pointerdown', () => {
        this.nearby = { kind: 'project', key: p.key, title: p.title }
        this.tryInteract()
      })

      const body = this.solids.create(
        x,
        y + 24,
        'bush',
      ) as Phaser.Physics.Arcade.Image
      body.setVisible(false)
      body.body!.setSize(64, 40)
      body.refreshBody()

      // Signboard plate (HTML thumbnails overlay this)
      this.add
        .rectangle(x, y - 4, 50, 30, 0x0a101c)
        .setStrokeStyle(2, 0x7dd3a0)
        .setDepth(9)

      const short =
        p.title.length > 10 ? `${p.title.slice(0, 9)}…` : p.title
      this.add
        .text(x, y + 58, short, {
          fontFamily: 'NeoDunggeunmo, monospace',
          fontSize: '12px',
          color: '#e6eef8',
          backgroundColor: '#152238',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(9)
    })
  }

  private spawnChimneySmoke(x: number, y: number) {
    const puff = () => {
      const s = this.add
        .image(x + Phaser.Math.Between(-2, 2), y, 'smoke')
        .setDisplaySize(10, 10)
        .setDepth(10)
        .setAlpha(0.7)
      this.tweens.add({
        targets: s,
        y: y - 28,
        x: x + Phaser.Math.Between(-10, 10),
        alpha: 0,
        scale: 1.6,
        duration: 1400,
        onComplete: () => s.destroy(),
      })
    }
    puff()
    this.time.addEvent({ delay: 900, loop: true, callback: puff })
  }

  private placeFountain() {
    const fx = MAP_W / 2
    const fy = 380
    this.add.image(fx, fy, 'fountain').setDisplaySize(72, 60).setDepth(7)
    const block = this.solids.create(
      fx,
      fy + 8,
      'fountain',
    ) as Phaser.Physics.Arcade.Image
    block.setVisible(false)
    block.body!.setSize(50, 28)
    block.refreshBody()
  }

  private placeEggs() {
    TOWN_EGGS.forEach((egg) => {
      if (egg.sprite === 'sign' || egg.sprite === 'arcade') {
        const key = egg.sprite === 'arcade' ? 'arcade' : 'sign'
        const size =
          egg.sprite === 'arcade'
            ? ([44, 56] as const)
            : ([36, 46] as const)
        const obj = this.add
          .image(egg.x, egg.y, key)
          .setDisplaySize(size[0], size[1])
          .setDepth(8)
          .setInteractive({ useHandCursor: true })
        obj.on('pointerdown', () => {
          this.nearby = {
            kind: 'egg',
            talk: egg.talk,
            label: egg.name,
            minigame: egg.minigame,
            eggId: egg.id,
          }
          this.tryInteract()
        })
        const block = this.solids.create(
          egg.x,
          egg.y + 10,
          'bush',
        ) as Phaser.Physics.Arcade.Image
        block.setVisible(false)
        block.body!.setSize(28, 20)
        block.refreshBody()
        this.add
          .text(egg.x, egg.y + 34, egg.sprite === 'arcade' ? 'PLAY' : '?', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '8px',
            color: '#f0c36a',
            backgroundColor: '#152238',
            padding: { x: 4, y: 2 },
          })
          .setOrigin(0.5)
          .setDepth(9)
      }

      if (egg.sprite === 'bench') {
        const bench = this.add
          .image(egg.x, egg.y, 'bench')
          .setDisplaySize(56, 28)
          .setDepth(7)
          .setInteractive({ useHandCursor: true })
        bench.on('pointerdown', () => {
          this.nearby = {
            kind: 'egg',
            talk: egg.talk,
            label: egg.name,
            eggId: egg.id,
          }
          this.tryInteract()
        })
        const block = this.solids.create(
          egg.x,
          egg.y + 4,
          'bush',
        ) as Phaser.Physics.Arcade.Image
        block.setVisible(false)
        block.body!.setSize(40, 12)
        block.refreshBody()
      }
    })
  }

  private placeNpcs() {
    TOWN_NPCS.forEach((npc) => {
      const sprite = this.add
        .sprite(npc.x, npc.y, npc.sprite, 0)
        .setScale(npc.sprite === 'npc-cat' ? 2.2 : 2)
        .setDepth(15)
        .setInteractive({ useHandCursor: true })

      sprite.on('pointerdown', () => {
        this.nearby = { kind: 'npc', npc }
        this.tryInteract()
      })

      this.tweens.add({
        targets: sprite,
        y: npc.y - 2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      if (npc.patrol) {
        this.tweens.add({
          targets: sprite,
          x: npc.x + npc.patrol.dx,
          y: npc.y + npc.patrol.dy,
          duration: npc.patrol.duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          onUpdate: () => {
            const frame = Math.floor(this.time.now / 200) % 2
            sprite.setFrame(frame)
          },
        })
      }

      this.add
        .text(npc.x, npc.y - 28, npc.name, {
          fontFamily: 'NeoDunggeunmo, monospace',
          fontSize: '13px',
          color: '#e6eef8',
          backgroundColor: '#152238aa',
          padding: { x: 5, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(16)

      this.npcSprites.push({ npc, sprite })
    })
  }

  private placeBirds() {
    for (let i = 0; i < 3; i++) {
      const bird = this.add
        .image(200 + i * 400, 120 + i * 30, 'bird')
        .setDisplaySize(16, 10)
        .setDepth(30)
        .setAlpha(0.85)
      this.tweens.add({
        targets: bird,
        x: bird.x + 900,
        y: bird.y + Phaser.Math.Between(-40, 40),
        duration: 9000 + i * 1200,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private tryInteract() {
    if (this.overlayOpen || !this.nearby) return
    this.overlayOpen = true
    this.physics.pause()
    this.player.anims.stop()

    if (this.nearby.kind === 'building') {
      this.markVisited(this.nearby.section)
      if (this.nearby.section === 'projects') {
        this.game.events.emit(PLAY_EVENT.TALK, {
          id: 'projects-gate',
          speaker: 'Projects Village',
          lines: [
            '퀘스트 간판들이 늘어선 마을이다.',
            '각 건물 간판(썸네일) 앞에서 E를 눌러 상세를 보자.',
          ],
        })
        return
      }
      this.game.events.emit(PLAY_EVENT.OPEN, { section: this.nearby.section })
      return
    }

    if (this.nearby.kind === 'project') {
      this.markVisited('projects')
      this.game.events.emit(PLAY_EVENT.PROJECT, { key: this.nearby.key })
      return
    }

    if (this.nearby.kind === 'npc') {
      this.game.events.emit(PLAY_EVENT.TALK, npcTalk(this.nearby.npc))
      return
    }

    if (this.nearby.minigame) {
      this.game.events.emit(PLAY_EVENT.MINIGAME, {
        id: this.nearby.minigame,
      })
      return
    }

    if (this.nearby.eggId === 'bench') {
      this.sitting = true
      this.player.setFrame(0)
      this.player.y += 4
    }
    if (this.nearby.eggId === 'pond') {
      this.spawnCoinSplash()
    }

    this.game.events.emit(PLAY_EVENT.TALK, this.nearby.talk)
  }

  private spawnCoinSplash() {
    const pond = TOWN_EGGS.find((e) => e.id === 'pond')
    if (!pond) return
    const coin = this.add
      .circle(pond.x, pond.y - 10, 3, 0xf0c36a)
      .setDepth(12)
    this.tweens.add({
      targets: coin,
      y: pond.y + 8,
      alpha: 0.2,
      duration: 420,
      onComplete: () => {
        coin.destroy()
        for (let i = 0; i < 5; i++) {
          const r = this.add
            .circle(pond.x, pond.y + 6, 2, 0x6eb0ff, 0.7)
            .setDepth(12)
          this.tweens.add({
            targets: r,
            x: pond.x + Phaser.Math.Between(-18, 18),
            y: pond.y + Phaser.Math.Between(-6, 10),
            alpha: 0,
            duration: 500,
            onComplete: () => r.destroy(),
          })
        }
      },
    })
  }

  private markVisited(section: PlaySection) {
    this.visited.add(section)
    const visited = [...this.visited]
    this.game.events.emit(PLAY_EVENT.VISIT, {
      section,
      visited,
      complete: visited.length >= PLAY_SECTIONS.length,
    })
  }

  private onOverlayClose() {
    if (this.sitting) {
      this.player.y -= 4
      this.sitting = false
    }
    this.overlayOpen = false
    this.physics.resume()
  }

  private refreshNearby() {
    this.nearby = null
    let best = Infinity

    for (const entry of this.npcSprites) {
      const dx = this.player.x - entry.sprite.x
      const dy = this.player.y - entry.sprite.y
      const d = dx * dx + dy * dy
      if (d < 52 * 52 && d < best) {
        best = d
        this.nearby = { kind: 'npc', npc: entry.npc }
      }
    }

    for (const egg of TOWN_EGGS) {
      const dx = this.player.x - egg.x
      const dy = this.player.y - egg.y
      const d = dx * dx + dy * dy
      if (d < egg.radius * egg.radius && d < best) {
        best = d
        this.nearby = {
          kind: 'egg',
          talk: egg.talk,
          label: egg.name,
          minigame: egg.minigame,
          eggId: egg.id,
        }
      }
    }

    for (const booth of this.projectBooths) {
      const dx = this.player.x - booth.x
      const dy = this.player.y - booth.y
      const d = dx * dx + dy * dy
      if (d < 58 * 58 && d < best) {
        best = d
        this.nearby = {
          kind: 'project',
          key: booth.key,
          title: booth.title,
        }
      }
    }

    for (const zone of ZONES) {
      const dx = this.player.x - zone.x
      const dy = this.player.y - zone.y
      const d = dx * dx + dy * dy
      if (d < 56 * 56 && d < best) {
        best = d
        this.nearby = {
          kind: 'building',
          section: zone.id,
          label: zone.label,
        }
      }
    }
  }

  private emitWorldState() {
    if (!this.player) return
    this.game.events.emit(PLAY_EVENT.STATE, {
      x: this.player.x,
      y: this.player.y,
      mapW: MAP_W,
      mapH: MAP_H,
      booths: [],
    })
  }

  private emitBoothScreens() {
    if (!this.projectBooths.length) return
    const cam = this.cameras.main
    const canvas = this.game.canvas
    const rect = canvas.getBoundingClientRect()
    const cssX = rect.width / Math.max(1, cam.width)
    const cssY = rect.height / Math.max(1, cam.height)
    const viewW = Math.max(0.0001, cam.worldView.width)
    const viewH = Math.max(0.0001, cam.worldView.height)

    const booths = this.projectBooths.map((b) => {
      const x =
        ((b.x - cam.worldView.x) / viewW) * cam.width * cssX
      const y =
        ((b.y - 4 - cam.worldView.y) / viewH) * cam.height * cssY
      return {
        key: b.key,
        title: b.title,
        image: b.image,
        x,
        y,
        w: (46 / viewW) * cam.width * cssX,
        h: (28 / viewH) * cam.height * cssY,
      }
    })

    this.game.events.emit(PLAY_EVENT.BOOTHS, booths)
  }

  private spawnRustle() {
    const p = this.add.circle(
      this.player.x + Phaser.Math.Between(-8, 8),
      this.player.y + 10,
      2,
      0x6eb0ff,
      0.7,
    )
    p.setDepth(19)
    this.tweens.add({
      targets: p,
      y: p.y - 12,
      alpha: 0,
      duration: 280,
      onComplete: () => p.destroy(),
    })
  }

  update(_time: number, delta: number) {
    if (!this.player?.body) return

    this.emitBoothScreens()

    this.stateCooldown -= delta
    if (this.stateCooldown <= 0) {
      this.emitWorldState()
      this.stateCooldown = 100
    }

    if (this.overlayOpen) return

    this.refreshNearby()

    const stick =
      (this.registry.get('stick') as PlayInputState | undefined) || {
        x: 0,
        y: 0,
      }

    let vx = stick.x
    let vy = stick.y

    if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1
      else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1
      else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1
    }

    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2
      vx *= inv
      vy *= inv
    }

    this.player.setVelocity(vx * SPEED, vy * SPEED)

    const moving = Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05
    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx < 0 ? 'left' : 'right'
      } else {
        this.facing = vy < 0 ? 'up' : 'down'
      }
      this.player.anims.play(`walk-${this.facing}`, true)

      this.rustleCooldown -= delta
      if (this.rustleCooldown <= 0) {
        this.spawnRustle()
        this.rustleCooldown = 160
      }
    } else {
      this.player.anims.stop()
      const idleFrame =
        this.facing === 'down'
          ? 0
          : this.facing === 'left'
            ? 2
            : this.facing === 'right'
              ? 4
              : 6
      this.player.setFrame(idleFrame)
    }

    if (this.nearby) {
      const text =
        this.nearby.kind === 'building'
          ? this.nearby.section === 'projects'
            ? `E · ${this.nearby.label} 입장`
            : `E · ${this.nearby.label} 들어가기`
          : this.nearby.kind === 'project'
            ? `E · ${this.nearby.title} 상세`
            : this.nearby.kind === 'npc'
              ? `E · ${this.nearby.npc.name}에게 말 걸기`
              : this.nearby.minigame
                ? `E · ${this.nearby.label} 플레이`
                : this.nearby.eggId === 'bench'
                  ? `E · ${this.nearby.label}에 앉기`
                  : this.nearby.eggId === 'pond'
                    ? `E · 동전 던지기`
                    : `E · ${this.nearby.label} 살펴보기`
      this.prompt
        .setText(text)
        .setPosition(this.player.x, this.player.y - 22)
        .setVisible(true)
    } else {
      this.prompt.setVisible(false)
    }
  }
}

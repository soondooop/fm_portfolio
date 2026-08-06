import Phaser from 'phaser'
import Boot from './scenes/Boot'
import Preload from './scenes/Preload'
import World from './scenes/World'

export function createPlayGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0a101c',
    pixelArt: true,
    antialias: false,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: 1800,
      height: 1520,
      parent,
      expandParent: false,
    },
    scene: [Boot, Preload, World],
    audio: {
      noAudio: true,
    },
  })
}

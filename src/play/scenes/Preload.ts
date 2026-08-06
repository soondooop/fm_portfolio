import Phaser from 'phaser'
import { generatePlayTextures } from '../textures'

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  create() {
    generatePlayTextures(this)
    this.scene.start('World')
  }
}

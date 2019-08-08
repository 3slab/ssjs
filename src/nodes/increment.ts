import {Node} from '../node'

export class IncrementNode extends Node {
  type = 'increment'

  constructor() {
    super()
  }

  async execute(value: number) {
    value = value + 1
    this.logger.log(`[${this.type} ${this.config.id}] executed ${value}`)
    return value
  }
}

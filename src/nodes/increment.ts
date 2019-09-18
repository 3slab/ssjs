import {Logger} from 'winston'

import {Node} from '../node'
import {logger as defaultLogger} from '../utils'

export class IncrementNode extends Node {
  static type = 'increment'

  constructor(config = {}, logger: Logger = defaultLogger) {
    super({}, config, logger)
  }

  async execute(value: number) {
    value = value + 1
    this.logDebug(`executed ${value}`)
    return value
  }
}

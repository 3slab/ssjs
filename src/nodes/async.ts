import {Logger} from 'winston'

import {Node} from '../node'
import {logger as defaultLogger} from '../utils'

export class AsyncNode extends Node {
  static type = 'async'

  constructor(config = {}, logger: Logger = defaultLogger) {
    super({}, config, logger)
  }

  async execute(value: number) {
    value = value + 1
    // tslint:disable-next-line:no-this-assignment
    let currentNode = this
    return new Promise(resolve => {
      setTimeout(() => {
        currentNode.logDebug(`executed ${value}`)
        resolve(value)
      }, 3000)
    })
  }
}

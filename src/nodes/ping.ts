import {Logger} from 'winston'

import {SourceNode} from '../node'
import {logger as defaultLogger} from '../utils'

export class PingSourceNode extends SourceNode {
  static type = 'ping'

  private value = 0
  private interval: NodeJS.Timeout | undefined

  constructor(config = {}, logger: Logger = defaultLogger) {
    super({}, config, logger)
  }

  doPause(): void {
    this.paused = true
  }

  doResume(): void {
    this.paused = false
  }

  doStop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  doStart(): void {
    this.interval = setInterval(() => {
      if (!this.paused) {
        this.leave(this.value)
        this.value++
      }
    }, 5000)
  }
}

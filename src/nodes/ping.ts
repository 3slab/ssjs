import {SourceNode} from '../node'

export class PingSourceNode extends SourceNode {
  type = 'ping'
  private value = 0
  private interval: NodeJS.Timeout | undefined

  constructor() {
    super()
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

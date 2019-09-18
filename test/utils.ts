import {Node, SourceNode, SyncNode} from '../src/node'
import {createLogger} from '../src/utils'

const silentLogger = createLogger()
silentLogger.transports.forEach(t => (t.silent = true))

export class TestSourceNode extends SourceNode {
  doPausedCalled = false
  doResumeCalled = false
  doStartCalled = false
  doStopCalled = false

  doPausedNbCall = 0
  doResumeNbCall = 0
  doStartNbCall = 0
  doStopNbCall = 0

  constructor() {
    super({}, {}, silentLogger)
  }

  doPause(): void {
    this.doPausedNbCall++
    this.doPausedCalled = true
  }

  doResume(): void {
    this.doResumeNbCall++
    this.doResumeCalled = true
  }

  doStart(): void {
    this.doStartNbCall++
    this.doStartCalled = true
  }

  doStop(): void {
    this.doStopNbCall++
    this.doStopCalled = true
  }

  push(value: any) {
    this.leave(value)
  }
}

export class TestErrorSourceNode extends TestSourceNode {
  constructor(protected error = new Error('my error')) {
    super()
  }

  // tslint:disable-next-line:no-unused
  async execute(value: any) {
    throw this.error
  }

  push(value: any) {
    this.enter(value)
  }
}

export class ErrorNode extends Node {
  constructor(protected error = new Error('my error')) {
    super({}, {}, silentLogger)
  }

  // tslint:disable-next-line:no-unused
  async execute(value: any) {
    throw this.error
  }
}

export class PrependNode extends Node {
  entered: string[] = []

  constructor(protected prefix = '') {
    super({}, {}, silentLogger)
  }

  enter(value: any) {
    this.entered.push(value)
    super.enter(value)
  }

  async execute(value: string) {
    return value + this.prefix
  }
}

export class LockedPrependNode extends PrependNode {
  locked = true

  constructor(protected prefix = '') {
    super(prefix)
  }

  unlock() {
    this.locked = false
  }

  async execute(value: string): Promise<string> {
    return new Promise(resolve => {
      let interval: NodeJS.Timeout

      interval = setInterval(() => {
        if (!this.locked) {
          clearInterval(interval)
          resolve(value)
        }
      }, 100)
    })
  }
}

export class MemorySyncNode extends SyncNode {
  ended: any[] = []

  constructor() {
    super({}, {}, silentLogger)
  }

  enter(value: any) {
    this.ended.push(value)
    super.enter(value)
  }
}

export class TestErrorSyncNode extends MemorySyncNode {
  constructor(protected error = new Error('my error')) {
    super()
  }

  // tslint:disable-next-line:no-unused
  async execute(value: any) {
    throw this.error
  }
}

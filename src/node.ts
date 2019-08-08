import * as async from 'async'
import * as console from 'console'
import {EventEmitter} from 'events'
import * as _ from 'lodash'

interface NodeConfig {
  [key: string]: any
}

export class Node extends EventEmitter {
  type = 'node'
  queue: async.AsyncQueue<any>
  config: NodeConfig
  logger: Console
  spec: NodeConfig

  constructor(spec = {}, config = {}, logger = console) {
    super()

    this.logger = logger

    this.spec = _.merge(
      {},
      {},
      spec
    )

    this.config = _.merge(
      {
        id: _.uniqueId('node-'),
        queueLength: 1
      },
      config
    )

    this.queue = async.queue(async (task, callback) => {
      try {
        let result = await this.execute(task)
        this.leave(result)
      } catch (err) {
        this.emit('error', err)
      }
      callback()
    }, this.config.queueLength)

    this.queue.drain(() => {
      this.emit('drain')
    })
  }

  enter(value: any) {
    this.logger.debug(`[${this.type} ${this.config.id}] value enter`)
    this.queue.push(value)
  }

  leave(value: any) {
    this.logger.debug(`[${this.type} ${this.config.id}] value leave`)
    this.emit('leave', value)
  }

  async execute(value: any) {
    this.logger.debug(`[${this.type} ${this.config.id}] node execute ${value}`)
    return Promise.resolve(value)
  }
}

export class SyncNode extends Node {
  type = 'sync'

  leave(value: any) {
    this.logger.log(`[${this.type} ${this.config.id}] value end`)
    this.emit('end', value)
  }
}

export abstract class SourceNode extends Node {
  type = 'source'
  paused = false

  protected constructor(spec = {}, config = {}, logger = console) {
    super(spec, config, logger)
  }

  start() {
    this.doStart()
    this.logger.log(`[${this.type} ${this.config.id}] started`)
  }

  abstract doStart(): void

  stop() {
    this.doStop()
    this.logger.log(`[${this.type} ${this.config.id}] stopped`)
  }

  abstract doStop(): void

  pause() {
    if (!this.paused) {
      this.paused = true
      this.doPause()
      this.logger.log(`[${this.type} ${this.config.id}] paused`)
    }
  }

  abstract doPause(): void

  resume() {
    if (this.paused) {
      this.paused = false
      this.doResume()
      this.logger.log(`[${this.type} ${this.config.id}] resumed`)
    }
  }

  abstract doResume(): void
}

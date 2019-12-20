import * as Joi from '@hapi/joi'
import * as async from 'async'
import {EventEmitter} from 'events'
import * as _ from 'lodash'
import {Logger} from 'winston'

import {logger as defaultLogger} from './utils'

interface NodeConfig {
  [key: string]: any
}

export class Node extends EventEmitter {
  static type = 'node'

  queue: async.AsyncQueue<any>
  config: NodeConfig
  logger: Logger

  constructor(spec = {}, config = {}, logger: Logger = defaultLogger) {
    super()

    this.logger = logger

    spec = Joi.object({
      id: Joi.string().required(),
      queueLength: Joi.number().min(1)
    }).append(spec)

    this.config = Joi.attempt(
      _.merge(
        {
          id: _.uniqueId('node-'),
          queueLength: 1
        },
        config
      ),
      spec
    )

    this.queue = async.queue(async task => {
      return this.execute(task)
    }, this.config.queueLength)

    this.queue.drain(() => {
      this.emit('drain')
    })
  }

  enter(value: any) {
    this.logDebug('value enter')
    this.queue.push(value, this.onTaskExecuted.bind(this))
  }

  leave(value: any) {
    this.logDebug('value leave')
    this.emit('leave', value)
  }

  pause() {
    throw Error('pause should only be called on SourceNode')
  }

  resume() {
    throw Error('resume should only be called on SourceNode')
  }

  stop() {
    throw Error('stop should only be called on SourceNode')
  }

  start() {
    throw Error('start should only be called on SourceNode')
  }

  async execute(value: any) {
    this.logDebug(`node execute ${value}`)
    return Promise.resolve(value)
  }

  delayResumeProcessing() {
    this.queue.pause()
    async.nextTick(this.queue.resume)
  }

  logDebug(msg: string) {
    this.logger.debug(`[${(this.constructor as typeof Node).type} ${this.config.id}] ${msg}`)
  }

  protected onTaskExecuted(err?: Error | null, result?: any): void {
    if (!err) {
      this.leave(result)
    } else {
      this.emit('error', err)
    }
  }
}

export class SyncNode extends Node {
  type = 'sync'

  constructor(spec = {}, config = {}, logger: Logger = defaultLogger) {
    super(spec, config, logger)
  }

  leave(value: any) {
    this.logDebug('value end')
    this.emit('end', value)
  }
}

export abstract class SourceNode extends Node {
  type = 'source'
  paused = false

  constructor(spec = {}, config = {}, logger: Logger = defaultLogger) {
    super(spec, config, logger)
  }

  start() {
    this.doStart()
    this.logDebug('started')
  }

  abstract doStart(): void

  stop() {
    this.doStop()
    this.logDebug('stopped')
  }

  abstract doStop(): void

  pause() {
    if (!this.paused) {
      this.paused = true
      this.doPause()
      this.logDebug('paused')
    }
  }

  abstract doPause(): void

  resume() {
    if (this.paused) {
      this.paused = false
      this.doResume()
      this.logDebug('resumed')
    }
  }

  abstract doResume(): void
}

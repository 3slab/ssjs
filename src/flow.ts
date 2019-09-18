import {EventEmitter} from 'events'
import * as _ from 'lodash'
import {Logger} from 'winston'

import {Node} from './node'
import {logger as defaultLogger} from './utils'

export class Flow extends EventEmitter {
  nodes: Node[]
  logger: Logger

  constructor(nodes: Node[], logger: Logger = defaultLogger) {
    super()
    this.nodes = nodes
    this.logger = logger
  }

  stop() {
    this.emit('pre-stop', this)
    let stopped = this.nodes[0].stop()
    this.emit('post-stop', this)
    return stopped
  }

  start() {
    this.emit('pre-start', this)
    this.bindEvents()
    this.nodes[0].start()
    this.emit('post-start', this)
  }

  isProcessing(): boolean {
    return _.some(this.nodes, (node: Node) => {
      return !node.queue.idle()
    })
  }

  protected resume() {
    this.emit('pre-resume', this)
    this.nodes[0].resume()
    this.emit('post-resume', this)
  }

  protected pause() {
    this.emit('pre-pause', this)
    this.nodes[0].pause()
    this.emit('post-pause', this)
  }

  protected bindEvents() {
    _.each(this.nodes, (node: Node, key: number) => {
      node.on('error', (err: Error) => {
        this.emit('error', err, node)
      })

      node.on('drain', () => {
        if (!this.isProcessing()) {
          this.emit('pre-drain')
          this.resume()
          this.emit('post-drain')
        }
      })

      node.on('leave', (value: any) => {
        this.pause()
        if (this.nodes.length !== key + 1) {
          this.nodes[key + 1].enter(value)
        }
      })
    })
  }
}

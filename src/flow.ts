import {EventEmitter} from 'events'
import * as _ from 'lodash'

import {Node, SourceNode, SyncNode} from './node'

export class Flow extends EventEmitter {
  nodes: Node[]
  source: SourceNode
  sync: SyncNode

  constructor(source: SourceNode, nodes: Node[], sync: SyncNode) {
    super()
    this.source = source
    this.nodes = nodes
    this.sync = sync
  }

  stop() {
    this.emit('pre-stop', this)
    let stopped = this.source.stop()
    this.emit('post-stop', this)
    return stopped
  }

  start() {
    this.emit('pre-start', this)
    this.bindEvents()
    this.source.start()
    this.emit('post-start', this)
  }

  allNodes(): Node[] {
    return [this.source, ...this.nodes, this.sync]
  }

  isProcessing(): boolean {
    return _.some(this.allNodes(), (node: Node) => {
      return !node.queue.idle()
    })
  }

  setSource(source: SourceNode) {
    this.source = source
  }

  setSync(sync: SyncNode) {
    this.sync = sync
  }

  addNode(node: Node) {
    this.nodes.push(node)
  }

  protected resume() {
    this.emit('pre-resume', this)
    this.source.resume()
    this.emit('post-resume', this)
  }

  protected pause() {
    this.emit('pre-pause', this)
    this.source.pause()
    this.emit('post-pause', this)
  }

  protected bindEvents() {
    _.each(this.allNodes(), (node: Node) => {
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
    })

    _.each(this.nodes, (node: Node, key: number) => {
      node.on('leave', (value: any) => {
        const nextNode = this.nodes.length - 1 !== key ? this.nodes[key + 1] : this.sync
        nextNode.enter(value)
        this.pause()
      })
    })

    this.source.on('leave', (value: any) => {
      this.pause()
      const nextNode = this.nodes.length ? this.nodes[0] : this.sync
      nextNode.enter(value)
    })
  }
}

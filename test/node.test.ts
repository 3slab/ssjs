import * as assert from 'assert'

import * as node from '../src/node'

import { ErrorNode, TestSourceNode } from './utils'

describe('node', function () {
  describe('.Node#enter', function () {
    it('should fill the node queue when a value enters', function () {
      const myNode = new node.Node()
      assert.strictEqual(myNode.queue.length(), 0)
      myNode.enter('value1')
      myNode.enter('value2')
      assert.strictEqual(myNode.queue.length(), 2)
    })
  })

  describe('.Node#leave', function () {
    it('should emit leave event when a value leaves', function () {
      const myNode = new node.Node()
      myNode.on('leave', value => {
        assert.strictEqual(value, 'the value entered')
      })

      myNode.enter('the value entered')
    })
  })

  describe('.Node#execute', function () {
    it('should returns the passed value as a promise', function (done) {
      const myNode = new node.Node()
      myNode.execute('the value entered').then(value => {
        assert.strictEqual(value, 'the value entered')
        done()
      })
    })

    it('should emit an error when an error occured during execution', function (done) {
      const myError = new Error('my error')
      const myNode = new ErrorNode(myError)

      myNode.enter('the value entered')

      myNode.on('error', err => {
        assert.strictEqual(err, myError)
        done()
      })
    })
  })

  describe('.SyncNode#leave', function () {
    it('should emit end event when a value leaves', function () {
      const myNode = new node.SyncNode()
      myNode.on('end', value => {
        assert.strictEqual(value, 'the value entered')
      })

      myNode.enter('the value entered')
    })
  })

  describe('.SourceNode', function () {
    it('should call doStart on start', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.start()
      assert.strictEqual(mySourceNode.doStartCalled, true)
    })

    it('should call doStop on stop', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.stop()
      assert.strictEqual(mySourceNode.doStopCalled, true)
    })

    it('should call doPause on pause if node not in paused state', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.pause()
      assert.strictEqual(mySourceNode.doPausedCalled, true)
    })

    it('should not call doPause on pause if node in paused state', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.paused = true
      mySourceNode.pause()
      assert.strictEqual(mySourceNode.doPausedCalled, false)
    })

    it('should not call doResume on resume if node not in paused state', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.resume()
      assert.strictEqual(mySourceNode.doResumeCalled, false)
    })

    it('should call doResume on resume if node in paused state', function () {
      const mySourceNode = new TestSourceNode()
      mySourceNode.paused = true
      mySourceNode.resume()
      assert.strictEqual(mySourceNode.doResumeCalled, true)
    })
  })
})

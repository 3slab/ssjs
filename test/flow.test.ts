import * as assert from 'assert'

import {Flow} from '../src/flow'

import {
  ErrorNode,
  LockedPrependNode,
  MemorySyncNode,
  PrependNode,
  TestErrorSourceNode,
  TestErrorSyncNode,
  TestSourceNode
} from './utils'

let myFlow: Flow
let mySource: TestSourceNode
let mySync: MemorySyncNode

beforeEach(() => {
  mySource = new TestSourceNode()
  mySync = new MemorySyncNode()
  myFlow = new Flow(
    mySource,
    [],
    mySync
  )
})

describe('flow', function () {
  describe('#allNodes', function () {
    it('should returns an array with the source, sync and all transformation nodes', function () {
      let myNode1 = new PrependNode()
      let myNode2 = new PrependNode()
      myFlow.addNode(myNode1)
      myFlow.addNode(myNode2)

      assert.strictEqual(myFlow.allNodes().length, 4)
      assert.strictEqual(myFlow.allNodes()[0], mySource)
      assert.strictEqual(myFlow.allNodes()[1], myNode1)
      assert.strictEqual(myFlow.allNodes()[2], myNode2)
      assert.strictEqual(myFlow.allNodes()[3], mySync)
    })
  })

  describe('#isProcessing', function () {
    it('should returns true while at least one value is being processed', function (done) {
      let myNode1 = new PrependNode(' one')
      let myNode2 = new LockedPrependNode(' two')
      myFlow.addNode(myNode1)
      myFlow.addNode(myNode2)

      myFlow.start()

      assert.strictEqual(myFlow.isProcessing(), false)

      mySource.push('zero')

      assert.strictEqual(myFlow.isProcessing(), true)

      myNode2.unlock()

      mySync.on('end', () => {
        done()
      })
    })
  })

  describe('#start', function () {
    it('should emits an error when one occurred in a node', function (done) {
      let myError = new Error('my error')
      let myErrorNode = new ErrorNode(myError)
      myFlow.addNode(myErrorNode)

      myFlow.start()
      mySource.push('value')

      myFlow.on('error', (err, node) => {
        assert.strictEqual(err, myError)
        assert.strictEqual(node, myErrorNode)
        done()
      })
    })

    it('should emits an error when one occurred in a source node', function (done) {
      let myError = new Error('my error')
      let myErrorNode = new TestErrorSourceNode(myError)
      myFlow.setSource(myErrorNode)

      myFlow.start()
      myErrorNode.push('value')

      myFlow.on('error', (err, node) => {
        assert.strictEqual(err, myError)
        assert.strictEqual(node, myErrorNode)
        done()
      })
    })

    it('should emits an error when one occurred in a sync node', function (done) {
      let myError = new Error('my error')
      let myErrorNode = new TestErrorSyncNode(myError)
      myFlow.setSync(myErrorNode)

      myFlow.start()
      mySource.push('value')

      myFlow.on('error', (err, node) => {
        assert.strictEqual(err, myError)
        assert.strictEqual(node, myErrorNode)
        done()
      })
    })

    it('should start the source node on flow start', function () {
      myFlow.start()
      assert.strictEqual(mySource.doStartCalled, true)
    })

    it('passes the value from node to end until sync', function (done) {
      let myNode1 = new PrependNode(' one')
      let myNode2 = new PrependNode(' two')
      myFlow.addNode(myNode1)
      myFlow.addNode(myNode2)
      myFlow.start()

      mySource.push('zero')

      mySync.on('end', () => {
        assert.deepStrictEqual(mySync.ended, ['zero one two'])
        done()
      })
    })

    it('pauses the source until no other work to be done', function (done) {
      let myNode1 = new PrependNode(' one')
      let myNode2 = new LockedPrependNode(' two')
      myFlow.addNode(myNode1)
      myFlow.addNode(myNode2)
      myFlow.start()

      assert.strictEqual(mySource.doPausedCalled, false)
      assert.strictEqual(mySource.doResumeCalled, false)

      mySource.push('zero1')

      assert.strictEqual(mySource.doPausedCalled, true)
      assert.strictEqual(mySource.doPausedNbCall, 1)
      assert.strictEqual(mySource.doResumeCalled, false)

      mySource.push('zero2')

      // Already in paused state, it should not called doPaused again
      assert.strictEqual(mySource.doPausedCalled, true)
      assert.strictEqual(mySource.doPausedNbCall, 1)
      assert.strictEqual(mySource.doResumeCalled, false)

      myNode2.unlock()

      // Wait for drain event on flow
      myFlow.on('pre-resume', () => {
        assert.strictEqual(mySource.doPausedCalled, true)
        assert.strictEqual(mySource.doPausedNbCall, 1)
        assert.strictEqual(mySource.doResumeCalled, false)
        assert.strictEqual(mySource.doResumeNbCall, 0)
      })

      myFlow.on('post-resume', () => {
        assert.strictEqual(mySource.doPausedCalled, true)
        assert.strictEqual(mySource.doPausedNbCall, 1)
        assert.strictEqual(mySource.doResumeCalled, true)
        assert.strictEqual(mySource.doResumeNbCall, 1)
        done()
      })
    })
  })

  describe('#stop', function () {
    it('should stop the source when stopping the flow', function () {
      myFlow.start()
      assert.strictEqual(mySource.doStartCalled, true)
      assert.strictEqual(mySource.doStopCalled, false)
      myFlow.stop()
      assert.strictEqual(mySource.doStartCalled, true)
      assert.strictEqual(mySource.doStopCalled, true)
    })
  })
})

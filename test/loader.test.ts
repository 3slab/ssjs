import * as assert from 'assert'
import * as fs from 'fs-extra'
import * as path from 'path'

import {SsjsNodeLoader} from '../src/loader'
import {AsyncNode, EndSyncNode, IncrementNode, PingSourceNode} from '../src/nodes'

let node1 = require('./fixtures/emptyconfig/node_modules/installed/nodes/src/node1')
let node2 = require('./fixtures/emptyconfig/node_modules/installed/nodes/src/node2')

describe('loader', function () {
  describe('#load', function () {
    describe('without changing the node_modules folder', function () {
      it('raises an error if a path in nodes.ssjs is not found', function () {
        let loader = new SsjsNodeLoader(path.join(__dirname, 'fixtures', 'wrongconfig', 'wrongconfiguration.ts'))
        assert.throws(loader.load)
      })

      it('raises an error if a reference in nodes.ssjs is not found', function () {
        let loader = new SsjsNodeLoader(path.join(__dirname, 'fixtures', 'wrongconfig2', 'wrongconfiguration.ts'))
        assert.throws(loader.load)
      })
    })

    describe('it changes the node_modules folder', function () {
      before(() => {
        fs.copySync(
          path.join(__dirname, 'fixtures', 'emptyconfig', 'ssjsrootnodemodules'),
          path.join(__dirname, '..', 'node_modules', 'ssjsrootnodemodules')
        )
        return true
      })

      after(() => {
        fs.removeSync(path.join(__dirname, '..', 'node_modules', 'ssjsrootnodemodules'))
        return true
      })

      it('should load nodes from three locations', function () {
        let loader = new SsjsNodeLoader(path.join(__dirname, 'fixtures', 'emptyconfig', 'emptyconfiguration.ts'))
        loader.load()

        assert.strictEqual(loader.nodeRefs.async, AsyncNode)
        assert.strictEqual(loader.nodeRefs.async.name, 'AsyncNode')
        assert.strictEqual(loader.nodeRefs.async.type, 'async')
        assert.strictEqual(loader.nodeRefs.end, EndSyncNode)
        assert.strictEqual(loader.nodeRefs.end.name, 'EndSyncNode')
        assert.strictEqual(loader.nodeRefs.end.type, 'end')
        assert.strictEqual(loader.nodeRefs.increment, IncrementNode)
        assert.strictEqual(loader.nodeRefs.increment.name, 'IncrementNode')
        assert.strictEqual(loader.nodeRefs.increment.type, 'increment')
        assert.strictEqual(loader.nodeRefs.ping, PingSourceNode)
        assert.strictEqual(loader.nodeRefs.ping.name, 'PingSourceNode')
        assert.strictEqual(loader.nodeRefs.ping.type, 'ping')

        assert.strictEqual(loader.nodeRefs.one, node1.OneNode)
        assert.strictEqual(loader.nodeRefs.one.name, 'OneNode')
        assert.strictEqual(loader.nodeRefs.one.type, 'one')
        assert.strictEqual(loader.nodeRefs.two, node2.TwoNode)
        assert.strictEqual(loader.nodeRefs.two.name, 'TwoNode')
        assert.strictEqual(loader.nodeRefs.two.type, 'two')

        // tslint:disable-next-line:no-implicit-dependencies
        let node3 = require('ssjsrootnodemodules/nodes/src/node3')
        // tslint:disable-next-line:no-implicit-dependencies
        let node4 = require('ssjsrootnodemodules/nodes/src/node4')

        assert.strictEqual(loader.nodeRefs.three, node3.ThreeNode)
        assert.strictEqual(loader.nodeRefs.three.name, 'ThreeNode')
        assert.strictEqual(loader.nodeRefs.three.type, 'three')
        assert.strictEqual(loader.nodeRefs.four, node4.FourNode)
        assert.strictEqual(loader.nodeRefs.four.name, 'FourNode')
        assert.strictEqual(loader.nodeRefs.four.type, 'four')
      })
    })
  })
})

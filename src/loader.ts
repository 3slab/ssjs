import * as fs from 'fs'
import * as path from 'path'
import {Logger} from 'winston'

import {Node} from './node'
import {checkDir, checkFile, logger as defaultLogger} from './utils'

const SSJS_NODES_LIST_FILE = 'nodes.ssjs'

interface NodeRefs {
  [key: string]: typeof Node
}

export class SsjsNodeLoader {
  logger: Logger
  configFile: string
  nodeRefs: NodeRefs = {}

  constructor(configFile: string, logger: Logger = defaultLogger) {
    this.logger = logger
    this.configFile = configFile
  }

  load() {
    this.loadStandardNodes()
    this.loadInstalledNodes()
    this.loadFlowNodes()
  }

  protected loadStandardNodes() {
    let ssjsRootPath = path.dirname(require.resolve('../package.json'))
    let ssjsNodesListFile = checkFile(path.join(ssjsRootPath, SSJS_NODES_LIST_FILE))
    this.loadSsjsNodesListFile(ssjsNodesListFile)
  }

  protected loadInstalledNodes() {
    this.loadAllNodesFromPaths(module.paths)
  }

  protected loadFlowNodes() {
    let configFileNodeModulesPath = path.join(path.dirname(this.configFile), 'node_modules')
    this.loadAllNodesFromPaths([configFileNodeModulesPath])
  }

  protected loadAllNodesFromPaths(pathArray: string[]) {
    this
      .loadTreeModulePathArray(pathArray)
      .reduce(
        function (ssjsNodesListFileArray: string[], modulePath: string) {
          try {
            let ssjsNodesListFile = checkFile(path.join(modulePath, SSJS_NODES_LIST_FILE))
            ssjsNodesListFileArray.push(ssjsNodesListFile)
          } catch {
            // TODO : logging
          }
          return ssjsNodesListFileArray
        },
        []
      )
      .forEach(ssjsNodesListFile => {
        this.loadSsjsNodesListFile(ssjsNodesListFile)
      })
  }

  protected loadTreeModulePathArray(pathArray: string[]): string[] {
    return this
      .filterOnlyDirFromPathArray(pathArray)
      .reduce(
        (modulesPathArray: string[], nodeModulesPath: string) => {
          let installedModulesPath = fs
            .readdirSync(nodeModulesPath)
            .map(item => path.join(nodeModulesPath, item))
          modulesPathArray.push(...this.filterOnlyDirFromPathArray(installedModulesPath))
          modulesPathArray.push(...this.loadTreeModulePathArray(installedModulesPath))
          return modulesPathArray
        },
        []
      )
  }

  protected filterOnlyDirFromPathArray(pathArray: string[]): string[] {
    return pathArray
      .filter((pathItem: string) => {
        try {
          return checkDir(pathItem)
        } catch {
          return false
        }
      })
  }

  protected loadSsjsNodesListFile(filePath: string) {
    let fileDir = path.dirname(filePath)
    let lines = fs.readFileSync(filePath, 'utf-8').split('\n')

    lines
      .filter(line => {
        return line
      })
      .map(line => {
        let [nodeClass, nodePath] = line.split(':')
        if (!path.isAbsolute(nodePath)) {
          nodePath = path.join(fileDir, nodePath)
        }
        nodePath = checkFile(nodePath)

        let ssjsNodeModule = require(nodePath)
        if (!ssjsNodeModule.hasOwnProperty(nodeClass)) {
          throw Error(`${nodeClass} not exported in module ${nodePath}`)
        }

        let nodeClassRef = ssjsNodeModule[nodeClass] as typeof Node
        let nodeType = nodeClassRef.type

        this.nodeRefs[nodeType] = nodeClassRef
      })
  }
}

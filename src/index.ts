import {Command, flags} from '@oclif/command'
// tslint:disable-next-line:no-implicit-dependencies
import {CLIError} from '@oclif/errors'
import * as fs from 'fs'
import * as path from 'path'

import {LockedPrependNode} from '../test/utils'

import {Flow} from './flow'
import {EndSyncNode, IncrementNode, PingSourceNode} from './nodes'

class Ssjs extends Command {
  static description = 'ssjs is the cli tool to get data from a source, ' +
    'process and transform them and send them to a sync. The source, ' +
    'the transformation and the sync are set in a custom ts module ' +
    'passed as argument from this command'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'file',
      description: 'path to the ssjs configuration file',
      hidden: false,
      default: ''
    }
  ]

  async run() {
    Ssjs.args[0].default = path.join(this.config.configDir, 'configuration.ts')
    const {args} = this.parse(Ssjs)

    const filePath = this.checkFile(args.file)

    let config = require(filePath)
    this.log(config)

    let myflow = new Flow(
      new PingSourceNode(),
      [new IncrementNode(), new IncrementNode(), new LockedPrependNode()],
      new EndSyncNode()
    )
    myflow.start()
  }

  checkFile(filePath: string): string {
    let stat: fs.Stats

    try {
      stat = fs.lstatSync(filePath)
    } catch {
      throw new CLIError(`${filePath} does not exit`)
    }

    if (!stat.isFile()) {
      throw new CLIError(`${filePath} is not a file`)
    }

    try {
      fs.accessSync(filePath, fs.constants.R_OK)
    } catch {
      throw new CLIError(`${filePath} file is not readable`)
    }

    return path.resolve(filePath)
  }
}

export = Ssjs

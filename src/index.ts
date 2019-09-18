import {Command, flags} from '@oclif/command'
// tslint:disable-next-line:no-implicit-dependencies
import {CLIError} from '@oclif/errors'
import * as path from 'path'

import {Flow} from './flow'
import {SsjsNodeLoader} from './loader'
import {EndSyncNode, IncrementNode, PingSourceNode} from './nodes'
import {checkFile, logger} from './utils'

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

    let filePath
    try {
      filePath = checkFile(args.file)
    } catch (e) {
      throw new CLIError(e.message)
    }

    //let config = require(filePath)
    logger.level = 'debug'

    let load = new SsjsNodeLoader(filePath, logger)
    load.load()

    let myflow = new Flow(
      [new PingSourceNode(), new IncrementNode(), new IncrementNode(), new IncrementNode(), new EndSyncNode()],
      logger
    )
    myflow.start()
  }
}

export = Ssjs

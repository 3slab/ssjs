import {Logger} from 'winston'

import {SyncNode} from '../node'
import {logger as defaultLogger} from '../utils'

export class EndSyncNode extends SyncNode {
  static type = 'end'

  constructor(config = {}, logger: Logger = defaultLogger) {
    super({}, config, logger)
  }
}

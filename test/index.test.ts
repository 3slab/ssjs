import {expect, test} from '@oclif/test'
import * as path from 'path'

import cmd = require('../src')

describe('ssjs', () => {
  test
    .do(() => cmd.run([]))
    .catch(err => expect(err.message).to.contain('configuration.ts does not exit'))
    .it('runs without any parameters exits with error message')

  test
    .do(() => cmd.run([]))
    .exit(2)
    .it('runs without any parameters exits with code 2')

  test
    .do(() => cmd.run(['this-file-does-not-exists.ts']))
    .catch(err => expect(err.message).to.equal('this-file-does-not-exists.ts does not exit'))
    .it('runs with unknown configuration file exits with error message')

  test
    .do(() => cmd.run([]))
    .exit(2)
    .it('runs with unknown configuration file exits with code 2')

  test
    .do(() => cmd.run([path.join(__dirname, 'fixtures')]))
    .catch(err => expect(err.message).to.contain('test/fixtures is not a file'))
    .it('runs with folder exits with error message')

  test
    .do(() => cmd.run([path.join(__dirname, 'fixtures')]))
    .exit(2)
    .it('runs with folder exits with code 2')

  /*test
    .do(() => cmd.run([path.join(__dirname, 'fixtures', 'emptyconfig', 'emptyconfiguration.ts')]))
    .it('runs with folder exits with error message')*/
})

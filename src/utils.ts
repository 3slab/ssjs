import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import * as winston from 'winston'

export function isString(message: any) {
  return typeof message === 'string' || message instanceof String
}

export function checkFile(filePath: string): string {
  let stat: fs.Stats

  try {
    stat = fs.lstatSync(filePath)
  } catch {
    throw new Error(`${filePath} does not exit`)
  }

  if (!stat.isFile()) {
    throw new Error(`${filePath} is not a file`)
  }

  try {
    fs.accessSync(filePath, fs.constants.R_OK)
  } catch {
    throw new Error(`${filePath} file is not readable`)
  }

  return path.resolve(filePath)
}

export function checkDir(filePath: string): string {
  let stat: fs.Stats

  try {
    stat = fs.lstatSync(filePath)
  } catch {
    throw new Error(`${filePath} does not exit`)
  }

  if (!stat.isDirectory()) {
    throw new Error(`${filePath} is not a directory`)
  }

  try {
    fs.accessSync(filePath, fs.constants.X_OK)
    fs.accessSync(filePath, fs.constants.R_OK)
  } catch {
    throw new Error(`${filePath} directory is not readable`)
  }

  return path.resolve(filePath)
}

export function createLogger(config: winston.LoggerOptions = {}): winston.Logger {
  return winston.createLogger(
    _.extend(
      {
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({level, message, timestamp}) => {
            return `${timestamp} - ${level} - ${!isString(message) ? JSON.stringify(message) : message}`
          })
        ),
        transports: [
          new winston.transports.Console()
        ]
      },
      config
    )
  )
}

export const logger: winston.Logger = createLogger()

// PORTS => THE PORTS ARE INTERFACES IMPLEMENTED BY THE ADAPTERS
// These interfaces is all of the business logic know, business logic dont know the implementation.
// The implementation must return the data defined here.

import { ILogger } from './logger'

export interface IChildProcessHandler {
  exec(): Promise<void>
}

export interface IClusterManagerOptions {
  logger: ILogger
  numCpus?: number
}

/**
 * Port to manage cluster mode
 * @namespace cluster
 */
export interface IClusterManager {
  start(childProcessHandler: IChildProcessHandler): void
}

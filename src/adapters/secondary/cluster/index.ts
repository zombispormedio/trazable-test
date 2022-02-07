import os from 'os'
import cluster from 'cluster'
import { IChildProcessHandler, IClusterManager, IClusterManagerOptions } from '../../../ports/cluster'
import { ILogger } from '../../../ports/logger'

export class ClusterManager implements IClusterManager {
  private readonly logger: ILogger
  private readonly numCPUs: number
  private readonly childProcessHandler: IChildProcessHandler

  constructor(childProcessHandler: IChildProcessHandler, options: IClusterManagerOptions) {
    this.logger = options.logger
    this.childProcessHandler = childProcessHandler
    if (options.numCpus && options.numCpus <= os.cpus().length) {
      this.numCPUs = options.numCpus
    } else {
      this.numCPUs = os.cpus().length
      this.logger.warn(
        `Number of configure CPUs is not configured or more than the number of CPUs available. Using ${this.numCPUs} CPUs`
      )
    }
  }

  public start(): void {
    if (cluster.isMaster) {
      this.logger.info('Primary is running')
      for (let index = 0; index < this.numCPUs; index++) {
        cluster.fork()
      }
      cluster.on('exit', worker => {
        this.logger.info(`Worker ${worker.process.pid} died`)
      })
    } else {
      this.logger.info('Worker started')
      this.childProcessHandler.exec()
    }
  }
}

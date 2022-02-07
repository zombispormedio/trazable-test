// APPLICATION INDEX
import cluster from 'cluster'
import process from 'process'
import { cpus } from 'os'
import { install as installSourceMapSupport } from 'source-map-support'

import { Add } from './use-cases/add'
import { ExpressApi } from './adapters/primary/rest/express'
import { MongoManager } from './adapters/secondary/mongo'
import { MongoExampleRepository } from './adapters/secondary/mongo/example.repository'

import { GetAll } from './use-cases/getAll'
import { ChangeName } from './use-cases/changeName'
import { ShowMessage } from './use-cases/showMessage'
import { GoogleWinstonLogger } from './adapters/secondary/google/logger'
import { GoogleCloudSecret } from './adapters/secondary/google/secret'
import { GoogleKMS } from './adapters/secondary/google/kms'
import { GoogleStorage } from './adapters/secondary/google/storage'
import { PubsubPublisher } from './adapters/secondary/google/queue'
import { NanoIdGenerator } from './adapters/secondary/nanoid-generator'
import { AxiosHttp } from './adapters/secondary/http/axios-http'
import { TrazableAuth } from './adapters/secondary/trazable/trazable-auth'
import {
  DATABASE_LOGGER,
  ADD_USE_CASE_LOGGER,
  GET_ALL_USE_CASE_LOGGER,
  CHANGE_NAME_USE_CASE_LOGGER,
  EXPRESS_API_LOGGER,
  SHOW_MESSAGE_USE_CASE_LOGGER,
  PUBSUB_LOGGER,
  EXAMPLE_CREATED_EVENT,
  CLUSTER_LOGGER,
} from './constants'
import { GooglePubSub } from './adapters/primary/queue/pubsub'
import { Config } from './config'
import { IChildProcessHandler } from './ports/cluster'
import { ClusterManager } from './adapters/secondary/cluster'

class ChildProcessHandler implements IChildProcessHandler {
  async exec(): Promise<void> {
    const mongoManager = new MongoManager(
      new GoogleCloudSecret(new GoogleKMS(), new GoogleStorage()),
      new GoogleWinstonLogger(DATABASE_LOGGER)
    )
    // Connect database and retrieve the client
    const mongoClient = await mongoManager.connect()

    // USE-CASE LOGGERS
    if (mongoClient) {
      /// //// PRIMARY PORTS (CORE) \\\\ \\\

      // ADD
      const addUseCaseLogger = new GoogleWinstonLogger(ADD_USE_CASE_LOGGER)
      const pubsubPublisher = new PubsubPublisher(
        EXAMPLE_CREATED_EVENT,
        Config.GCLOUD_PROJECT_ID || '',
        addUseCaseLogger
      )
      await pubsubPublisher.createTopicIfNotExists()
      const addUseCase = new Add(
        new MongoExampleRepository(mongoClient, addUseCaseLogger),
        addUseCaseLogger,
        new NanoIdGenerator(),
        pubsubPublisher
      )

      // GET ALL
      const getAllUseCaseLogger = new GoogleWinstonLogger(GET_ALL_USE_CASE_LOGGER)
      const getAllUseCase = new GetAll(
        new MongoExampleRepository(mongoClient, getAllUseCaseLogger),
        getAllUseCaseLogger
      )

      // CHANGE NAME
      const changeNameUseCaseLogger = new GoogleWinstonLogger(CHANGE_NAME_USE_CASE_LOGGER)
      const changeNameUseCase = new ChangeName(
        new MongoExampleRepository(mongoClient, changeNameUseCaseLogger),
        changeNameUseCaseLogger
      )

      // LOG CREATION
      const showMessageUseCase = new ShowMessage(new GoogleWinstonLogger(SHOW_MESSAGE_USE_CASE_LOGGER))

      /// //// PRIMARY ADAPTERS (INPUT) \\\\ \\\

      // EXPRESS API
      const api = new ExpressApi(
        addUseCase,
        getAllUseCase,
        changeNameUseCase,
        new GoogleWinstonLogger(EXPRESS_API_LOGGER),
        new TrazableAuth(new AxiosHttp(), Config.AUTH_URL)
      )
      // Start api at port 8080
      api.start(Config.PORT || '8080')

      // GOOGLE PUBSUB
      const googlePubSub = new GooglePubSub(
        Config.GCLOUD_PROJECT_ID || '',
        EXAMPLE_CREATED_EVENT,
        showMessageUseCase,
        new GoogleWinstonLogger(PUBSUB_LOGGER)
      )
      // Start pubsub subscriptions
      await googlePubSub.startSubscriptions()
    }
  }
}
;(async () => {
  // Source mapping => compiled js
  installSourceMapSupport()
  const clusterManager = new ClusterManager(new ChildProcessHandler(), {
    logger: new GoogleWinstonLogger(CLUSTER_LOGGER),
    numCpus: Config.CONCURRENCY_NUM_CPUS,
  })
  clusterManager.start()
})()

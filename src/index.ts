// APPLICATION INDEX
import { install as installSourceMapSupport } from 'source-map-support'

import { ExpressApi } from './adapters/primary/rest/express'
import { MongoManager } from './adapters/secondary/mongo'
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
  CREATE_USER_USE_CASE_LOGGER,
  EXPRESS_API_LOGGER,
  PUBSUB_LOGGER,
  USER_CREATED_EVENT,
  CLUSTER_LOGGER,
  GET_ALL_NOTIFICATIONS_USE_CASE_LOGGER,
  UDPATE_DISCOUNT_PERCENTAGE_USE_CASE_LOGGER,
  GET_ALL_USERS_USE_CASE_LOGGER,
  APPLY_DISCOUNT_TO_USER_USE_CASE_LOGGER,
  CREATE_NOTIFICATION_USE_CASE_LOGGER,
  DISCOUNT_UPDATED_EVENT,
} from './constants'
import { GooglePubSub } from './adapters/primary/queue/pubsub'
import { Config } from './config'
import { IChildProcessHandler } from './ports/cluster'
import { ClusterManager } from './adapters/secondary/cluster'
import { CreateUser } from './use-cases/createUser'
import { MongoUserRepository } from './adapters/secondary/mongo/user.repository'
import { GetAllNotifications } from './use-cases/getAllNotifications'
import { MongoNotificationRepository } from './adapters/secondary/mongo/notification.repository'
import { MongoDiscountRepository } from './adapters/secondary/mongo/discount.repository'
import { UpdateDiscountPercentage } from './use-cases/updateDiscountPercentage'
import { GetAllUsers } from './use-cases/getAllUsers'
import { ApplyDiscountToUser } from './use-cases/applyDiscountToUser'
import { CreateNotification } from './use-cases/createNotification'

class ChildProcessHandler implements IChildProcessHandler {
  async exec(): Promise<void> {
    const mongoManager = new MongoManager(
      new GoogleCloudSecret(new GoogleKMS(), new GoogleStorage()),
      new GoogleWinstonLogger(DATABASE_LOGGER)
    )
    // Connect database and retrieve the client
    const mongoClient = await mongoManager.connect()

    if (mongoClient) {
      const createUserUseCaseLogger = new GoogleWinstonLogger(CREATE_USER_USE_CASE_LOGGER)
      const userPubsubPublisher = new PubsubPublisher(
        USER_CREATED_EVENT,
        Config.GCLOUD_PROJECT_ID || '',
        createUserUseCaseLogger
      )
      await userPubsubPublisher.createTopicIfNotExists()

      const createUserUseCase = new CreateUser(
        new MongoUserRepository(mongoClient, createUserUseCaseLogger),
        createUserUseCaseLogger,
        new NanoIdGenerator(),
        userPubsubPublisher
      )

      // GET ALL Users
      const getAllUsersUseCaseLogger = new GoogleWinstonLogger(GET_ALL_USERS_USE_CASE_LOGGER)
      const getAllUsersUseCase = new GetAllUsers(
        new MongoUserRepository(mongoClient, getAllUsersUseCaseLogger),
        getAllUsersUseCaseLogger
      )

      // GET ALL Notifications
      const getAllNotificationsUseCaseLogger = new GoogleWinstonLogger(GET_ALL_NOTIFICATIONS_USE_CASE_LOGGER)
      const getAllNotificationsUseCase = new GetAllNotifications(
        new MongoNotificationRepository(mongoClient, getAllNotificationsUseCaseLogger),
        getAllNotificationsUseCaseLogger
      )

      // Update Discount Percentage
      const updateDiscountPercentageUseCaseLogger = new GoogleWinstonLogger(UDPATE_DISCOUNT_PERCENTAGE_USE_CASE_LOGGER)
      const discountPubsubPublisher = new PubsubPublisher(
        DISCOUNT_UPDATED_EVENT,
        Config.GCLOUD_PROJECT_ID || '',
        updateDiscountPercentageUseCaseLogger
      )
      await discountPubsubPublisher.createTopicIfNotExists()

      const updateDiscountPercentageUseCase = new UpdateDiscountPercentage(
        new MongoDiscountRepository(mongoClient, updateDiscountPercentageUseCaseLogger),

        updateDiscountPercentageUseCaseLogger,
        discountPubsubPublisher
      )

      const applyDiscountToUserUseCaseLogger = new GoogleWinstonLogger(APPLY_DISCOUNT_TO_USER_USE_CASE_LOGGER)
      const applyDiscountToUserUseCase = new ApplyDiscountToUser(
        new MongoDiscountRepository(mongoClient, applyDiscountToUserUseCaseLogger),
        applyDiscountToUserUseCaseLogger,
        new NanoIdGenerator()
      )

      const createNotificationUseCaseLogger = new GoogleWinstonLogger(CREATE_NOTIFICATION_USE_CASE_LOGGER)
      const createNotificationUseCase = new CreateNotification(
        new MongoNotificationRepository(mongoClient, createNotificationUseCaseLogger),
        createNotificationUseCaseLogger,
        new NanoIdGenerator()
      )

      /// //// PRIMARY ADAPTERS (INPUT) \\\\ \\\

      // EXPRESS API
      const api = new ExpressApi(
        createUserUseCase,
        getAllUsersUseCase,
        updateDiscountPercentageUseCase,
        getAllNotificationsUseCase,
        {
          logger: new GoogleWinstonLogger(EXPRESS_API_LOGGER),
          auth: new TrazableAuth(new AxiosHttp(), Config.AUTH_URL),
        }
      )
      // Start api at port 8080
      api.start(Config.PORT || '8080')

      // GOOGLE PUBSUB
      const googlePubSub = new GooglePubSub(
        Config.GCLOUD_PROJECT_ID || '',
        USER_CREATED_EVENT,
        DISCOUNT_UPDATED_EVENT,
        createNotificationUseCase,
        applyDiscountToUserUseCase,
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

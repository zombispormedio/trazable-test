import { PubSub } from '@google-cloud/pubsub'

import { UserHandler } from './message-handlers/user.handler'
import { ShowMessage } from '../../../../use-cases/showMessage'
import { ILogger } from '../../../../ports/logger'

import { Subscription } from './subscription'
import { Config } from '../../../../config'
import { CreateNotification } from '../../../../use-cases/createNotification'
import { ApplyDiscountToUser } from '../../../../use-cases/applyDiscountToUser'

/*
 * Google PubSub configuration
 */
export class GooglePubSub {
  private readonly createNotificationUseCase: CreateNotification
  private readonly applyDiscountToUserUseCase: ApplyDiscountToUser
  private readonly logger: ILogger
  private readonly pubSubClient: PubSub
  private readonly topicName: string

  constructor(
    projectId: string,
    topicName: string,
    createNotificationUseCase: CreateNotification,
    applyDiscountToUserUseCase: ApplyDiscountToUser,
    logger: ILogger
  ) {
    this.createNotificationUseCase = createNotificationUseCase
    this.applyDiscountToUserUseCase = applyDiscountToUserUseCase
    this.logger = logger
    this.topicName = topicName
    this.pubSubClient = new PubSub({ projectId })
  }

  /**
   * START pubsub subscriptions
   */
  async startSubscriptions(): Promise<void> {
    const userHandler = new UserHandler(this.createNotificationUseCase, this.applyDiscountToUserUseCase)

    await new Subscription(
      this.pubSubClient,
      userHandler.applyDiscountToUserHandler,
      this.logger,
      Config.DISCOUNT_SUBSCRIPTION_NAME
    ).initSubscription(this.topicName)

    await new Subscription(
      this.pubSubClient,
      userHandler.createNotificationHandler,
      this.logger,
      Config.NOTIFICATION_SUBSCRIPTION_NAME
    ).initSubscription(this.topicName)
  }
}

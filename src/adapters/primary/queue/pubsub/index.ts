import { PubSub } from '@google-cloud/pubsub'

import { UserHandler } from './message-handlers/user.handler'
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
  private readonly userTopicName: string
  private readonly discountTopicName: string

  constructor(
    projectId: string,
    userTopicName: string,
    discountTopicName: string,
    createNotificationUseCase: CreateNotification,
    applyDiscountToUserUseCase: ApplyDiscountToUser,
    logger: ILogger
  ) {
    this.createNotificationUseCase = createNotificationUseCase
    this.applyDiscountToUserUseCase = applyDiscountToUserUseCase
    this.logger = logger
    this.userTopicName = userTopicName
    this.discountTopicName = discountTopicName
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
      Config.APPLY_WELCOME_DISCOUNT_SUBSCRIPTION_NAME
    ).initSubscription(this.discountTopicName)

    await new Subscription(
      this.pubSubClient,
      userHandler.createWelcomeNotificationHandler,
      this.logger,
      Config.WELCOME_NOTIFICATION_SUBSCRIPTION_NAME
    ).initSubscription(this.userTopicName)

    await new Subscription(
      this.pubSubClient,
      userHandler.createUpdatedDiscountNotificationHandler,
      this.logger,
      Config.CHANGED_DISCOUNT_NOTIFICATION_SUBSCRIPTION_NAME
    ).initSubscription(this.discountTopicName)
  }
}

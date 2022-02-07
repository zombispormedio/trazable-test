import { Message, PubSub } from '@google-cloud/pubsub'
import { ILogger } from '../../../../ports/logger'

/**
 * General abstraction to connect to subscriptions and execute a handler on message
 */
export class Subscription {
  private readonly pubSubClient: PubSub
  private readonly messageHandler: (topicName: string, message: Message) => Promise<void>
  private readonly logger: ILogger
  private readonly subscriptionName?: string

  constructor(
    pubSubClient: PubSub,
    messageHandler: (topicName: string, message: Message) => Promise<void>,
    logger: ILogger,
    subscriptionName?: string
  ) {
    this.pubSubClient = pubSubClient
    this.messageHandler = messageHandler
    this.logger = logger
    this.subscriptionName = subscriptionName
  }

  async initSubscription(topicName: string): Promise<void> {
    if (this.subscriptionName) {
      await this.createSubscriptionIfNotExists(topicName, this.subscriptionName)
      const subscription = this.pubSubClient.subscription(this.subscriptionName)

      // Subscription handler
      subscription.on('message', (message: Message) => this.messageHandler(topicName, message))
      subscription.on('error', async error => {
        this.logger.error(error.details)
      })
    }
  }

  private async createSubscriptionIfNotExists(topicName: string, subscriptionName: string): Promise<void> {
    const [subscriptions] = await this.pubSubClient.getSubscriptions()

    const subscriptionsNames = subscriptions.map(({ name }) => name.split('/')[name.split('/').length - 1])
    if (!subscriptionsNames.includes(subscriptionName)) {
      await this.pubSubClient.createSubscription(topicName, subscriptionName)
    }
  }
}

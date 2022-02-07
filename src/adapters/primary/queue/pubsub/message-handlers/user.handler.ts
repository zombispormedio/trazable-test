import { Message } from '@google-cloud/pubsub'
import { MessageAtributes } from '../../../../../ports/queue'
import { ApplyDiscountToUser } from '../../../../../use-cases/applyDiscountToUser'
import { CreateNotification } from '../../../../../use-cases/createNotification'

// This secondary adapter calls directly the useCases.
export class UserHandler {
  private readonly createNotificationUseCase: CreateNotification
  private readonly applyDiscountToUserUseCase: ApplyDiscountToUser

  constructor(createNotificationUseCase: CreateNotification, applyDiscountToUserUseCase: ApplyDiscountToUser) {
    this.createNotificationUseCase = createNotificationUseCase
    this.applyDiscountToUserUseCase = applyDiscountToUserUseCase
  }

  createWelcomeNotificationHandler = async (topicName: string, message: Message): Promise<void> => {
    try {
      const messageAttributes = message.attributes as MessageAtributes

      const user = JSON.parse(message.data.toString())

      this.createNotificationUseCase.logger.setCorrelationId(messageAttributes.correlationId)
      await this.createNotificationUseCase.execute(topicName, user._id)
      message.ack()
    } catch (error) {
      this.createNotificationUseCase.logger.error(error)
    }
  }

  createUpdatedDiscountNotificationHandler = async (topicName: string, message: Message): Promise<void> => {
    try {
      const messageAttributes = message.attributes as MessageAtributes

      const discount = JSON.parse(message.data.toString())

      this.createNotificationUseCase.logger.setCorrelationId(messageAttributes.correlationId)
      await this.createNotificationUseCase.execute(topicName, discount.userId, discount.percentage)
      message.ack()
    } catch (error) {
      this.createNotificationUseCase.logger.error(error)
    }
  }

  applyDiscountToUserHandler = async (topicName: string, message: Message): Promise<void> => {
    try {
      const messageAttributes = message.attributes as MessageAtributes

      this.applyDiscountToUserUseCase.logger.setCorrelationId(messageAttributes.correlationId)
      await this.applyDiscountToUserUseCase.execute(JSON.parse(message.data.toString()))
      message.ack()
    } catch (error) {
      this.applyDiscountToUserUseCase.logger.error(error)
    }
  }
}

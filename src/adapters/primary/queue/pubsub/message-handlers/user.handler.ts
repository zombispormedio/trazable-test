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

  createNotificationHandler = async (message: Message): Promise<void> => {
    try {
      const messageAttributes = message.attributes as MessageAtributes

      this.createNotificationUseCase.logger.setCorrelationId(messageAttributes.correlationId)
      await this.createNotificationUseCase.execute(
        JSON.parse(message.data.toString()),
        'Welcome, thanks for registering!'
      )
      message.ack()
    } catch (error) {
      this.createNotificationUseCase.logger.error(error)
    }
  }

  applyDiscountToUserHandler = async (message: Message): Promise<void> => {
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

import { ILogger } from '../../ports/logger'
import { IIDGenerator } from '../../ports/id-generator'
import { Notification } from '../../entities/notification'
import { INotificationRepository } from '../../repositories/notification.repository'
import { NOTIFICATION_MESSAGES, USER_CREATED_EVENT, DISCOUNT_UPDATED_EVENT } from '../../constants'

/**
 * Add new User UseCase
 * @namespace User
 */
export class CreateNotification {
  private readonly repository: INotificationRepository
  public readonly logger: ILogger
  private readonly idGenerator: IIDGenerator

  constructor(repository: INotificationRepository, logger: ILogger, idGenerator: IIDGenerator) {
    this.repository = repository
    this.logger = logger
    this.idGenerator = idGenerator
  }

  /**
   * UseCase executer
   *
   * @param user - user to be notification
   * @param message - Notification message
   */
  async execute(eventName: string, userId: string, ...arguments_: any): Promise<Notification | void> {
    this.logger.info('Creating a new notification')

    let message

    switch (eventName) {
      case USER_CREATED_EVENT:
        message = NOTIFICATION_MESSAGES.USER_CREATED_EVENT(...arguments_)
        break
      case DISCOUNT_UPDATED_EVENT:
        message = NOTIFICATION_MESSAGES.DISCOUNT_UPDATED_EVENT(...arguments_)
        break
    }

    if (message) {
      const newNotification = new Notification({
        _id: this.idGenerator.generate(),
        userId,
        message,
        createdAt: new Date(),
      })

      await this.repository.save(newNotification)

      this.logger.info('New notification created succesfully')

      return newNotification
    }
  }
}

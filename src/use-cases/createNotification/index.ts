import { ILogger } from '../../ports/logger'
import { IIDGenerator } from '../../ports/id-generator'
import { IUser } from '../../entities/user'
import { Notification } from '../../entities/notification'
import { INotificationRepository } from '../../repositories/notification.repository'

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
  async execute(user: IUser, message: string): Promise<void> {
    this.logger.info('Creating a new notification')

    const newNotification = new Notification({
      _id: this.idGenerator.generate(),
      userId: user._id,
      message,
      createdAt: new Date(),
    })

    await this.repository.save(newNotification)

    this.logger.info('New discount created succesfully')
  }
}

import { ILogger } from '../../ports/logger'
import { Notification } from '../../entities/notification'
import { INotificationRepository } from '../../repositories/notification.repository'

/**
 * Get all notifications UseCase
 * @namespace Notification
 */
export class GetAllNotifications {
  private readonly repository: INotificationRepository
  public readonly logger: ILogger

  constructor(repository: INotificationRepository, logger: ILogger) {
    this.repository = repository
    this.logger = logger
  }

  /**
   * UseCase executer
   *
   * @returns All the notifications
   */
  async execute(userId: string): Promise<Notification[]> {
    this.logger.info('Retrieving the notifications')
    return this.repository.getAllByUserId(userId)
  }
}

import { Notification, INotification } from '../../../entities/notification'

/**
 *
 */
export class NotificationDTO {
  private readonly notification: Notification

  constructor(notification: Notification) {
    this.notification = notification
  }

  toJSON(): Pick<INotification, '_id' | 'message'> {
    return {
      _id: this.notification._id,
      message: this.notification.message,
    }
  }
}

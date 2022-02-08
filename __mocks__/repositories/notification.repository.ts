/* eslint-disable @typescript-eslint/no-unused-vars */
import { Notification } from '../../src/entities/notification'
import { INotificationRepository } from '../../src/repositories/notification.repository'

export class FakeNotificationRepository implements INotificationRepository {
  save(notification: Notification): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getAllByUserId(userId: string): Promise<Notification[]> {
    throw new Error('Method not implemented.')
  }
}

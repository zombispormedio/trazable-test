// PORTS => THE PORTS ARE INTERFACES IMPLEMENTED BY THE ADAPTERS
// These interfaces is all of the business logic know, business logic dont know the implementation.
// The implementation must return the data defined here.

import { Notification } from '../entities/notification'

// REPOSITORY
// This interface (secondary port) follow the repository pattern instead the hexagonal architecture naming.
export interface INotificationRepository {
  /**
   * Save an Notification
   *
   * @param  - New notification to create
   */
  save(notification: Notification): Promise<void>

  /**
   * Get all notifications
   *
   * @return All notifications
   */
  getAllByUserId(userId: string): Promise<Notification[]>
}

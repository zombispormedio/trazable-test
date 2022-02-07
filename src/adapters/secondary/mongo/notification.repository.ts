import { MongoClient } from 'mongodb'
import { ILogger } from '../../../ports/logger'
import { INotificationRepository } from '../../../repositories/notification.repository'
import { Notification } from '../../../entities/notification'

export class MongoNotificationRepository implements INotificationRepository {
  private readonly client: MongoClient
  private readonly logger: ILogger
  private readonly COLLECTION = 'notifications'

  constructor(client: MongoClient, logger: ILogger) {
    this.client = client
    this.logger = logger
  }

  async save(notification: Notification): Promise<void> {
    this.logger.info('Saving entity notification in the database')
    await this.client.db().collection(this.COLLECTION).insertOne(notification)
  }

  async getAllByUserId(userId: string): Promise<Notification[]> {
    this.logger.info('Retrieving all notifications from the database')
    const result = await this.client.db().collection(this.COLLECTION).find({ userId }).toArray()
    return result.map(document => new Notification(document))
  }
}

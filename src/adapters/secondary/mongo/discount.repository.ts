import { MongoClient } from 'mongodb'
import { Discount } from '../../../entities/discount'
import { ILogger } from '../../../ports/logger'
import { IDiscountRepository } from '../../../repositories/discount.repository'

export class MongoDiscountRepository implements IDiscountRepository {
  private readonly client: MongoClient
  private readonly logger: ILogger
  private readonly COLLECTION = 'discounts'

  constructor(client: MongoClient, logger: ILogger) {
    this.client = client
    this.logger = logger
  }

  async save(discount: Discount): Promise<void> {
    this.logger.info('Saving entity example in the database')
    await this.client.db().collection(this.COLLECTION).insertOne(discount)
  }

  async update(discount: Discount): Promise<void> {
    this.logger.info('Update discount in the database')
    await this.client.db().collection(this.COLLECTION).updateOne({ _id: discount._id }, { $set: discount })
  }

  async getByUserIdFromDate(userId: string, from: Date): Promise<Discount | undefined> {
    this.logger.info('Retrieving entity by name from the database')
    const result = await this.client
      .db()
      .collection(this.COLLECTION)
      .findOne({ userId, expiresAt: { $gte: from } })
    return result ? new Discount(result) : undefined
  }
}

import { MongoClient } from 'mongodb'
import { IUserRepository } from '../../../repositories/user.repository'
import { User } from '../../../entities/user'
import { ILogger } from '../../../ports/logger'

export class MongoUserRepository implements IUserRepository {
  private readonly client: MongoClient
  private readonly logger: ILogger
  private readonly COLLECTION = 'users'

  constructor(client: MongoClient, logger: ILogger) {
    this.client = client
    this.logger = logger
  }

  async getAll(): Promise<User[]> {
    this.logger.info('Retrieving all users from the database')
    const result = await this.client.db().collection(this.COLLECTION).find().toArray()
    return result.map(document => new User(document))
  }

  async save(user: User): Promise<void> {
    this.logger.info('Saving entity user in the database')
    await this.client.db().collection(this.COLLECTION).insertOne(user)
  }

  async getByEmail(email: string): Promise<User | undefined> {
    this.logger.info('Retrieving entity by name from the database')
    const result = await this.client.db().collection(this.COLLECTION).findOne({ email })
    return result ? new User(result) : undefined
  }
}

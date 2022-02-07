import { AlreadyExistsError } from '../../exceptions/already-exists'
import { PropertyRequiredError } from '../../exceptions/property-required'
import { ILogger } from '../../ports/logger'
import { IIDGenerator } from '../../ports/id-generator'
import { IQueue, MessageAttributeOperation } from '../../ports/queue'
import { IUserRepository } from '../../repositories/user.repository'
import { User } from '../../entities/user'
import { PropertyInvalidError } from '../../exceptions/property-invalid'

/**
 * Add new User UseCase
 * @namespace User
 */
export class CreateUser {
  private readonly repository: IUserRepository
  public readonly logger: ILogger
  private readonly idGenerator: IIDGenerator
  private readonly queue: IQueue

  constructor(repository: IUserRepository, logger: ILogger, idGenerator: IIDGenerator, queue: IQueue) {
    this.repository = repository
    this.logger = logger
    this.idGenerator = idGenerator
    this.queue = queue
  }

  /**
   * UseCase executer
   *
   * @param user - New user to create
   *
   */
  async execute({ name, email }: { name: string; email: string }): Promise<void> {
    this.logger.info('Creating a new user')

    if (!name) throw new PropertyRequiredError('name')
    if (!email) throw new PropertyRequiredError('email')
    if (!User.isValidEmail(email)) throw new PropertyInvalidError('email is invalid')

    const userAlreadyExist = await this.repository.getByEmail(email)
    if (userAlreadyExist) throw new AlreadyExistsError()
    const newUser = new User({
      _id: this.idGenerator.generate(),
      name,
      email,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    await this.repository.save(newUser)

    this.logger.info('New user created succesfully')

    this.queue.publish(JSON.stringify(newUser), {
      version: '1',
      collection: 'users',
      operation: MessageAttributeOperation.CREATE,
    })
  }
}

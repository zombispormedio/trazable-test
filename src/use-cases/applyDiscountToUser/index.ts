import { ILogger } from '../../ports/logger'
import { IIDGenerator } from '../../ports/id-generator'
import { IUser } from '../../entities/user'
import { IDiscountRepository } from '../../repositories/discount.repository'
import { Discount } from '../../entities/discount'

/**
 * Add new User UseCase
 * @namespace User
 */
export class ApplyDiscountToUser {
  private readonly repository: IDiscountRepository
  public readonly logger: ILogger
  private readonly idGenerator: IIDGenerator

  constructor(repository: IDiscountRepository, logger: ILogger, idGenerator: IIDGenerator) {
    this.repository = repository
    this.logger = logger
    this.idGenerator = idGenerator
  }

  /**
   * UseCase executer
   *
   * @param user - User to apply discount
   *
   */
  async execute(user: IUser): Promise<void> {
    this.logger.info('Creating a new discount')
    const newDiscount = new Discount({
      _id: this.idGenerator.generate(),
      userId: user._id,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    await this.repository.save(newDiscount)

    this.logger.info('New discount created succesfully')
  }
}

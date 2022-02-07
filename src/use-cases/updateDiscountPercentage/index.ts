import { NotFoundError } from '../../exceptions/not-found'
import { ILogger } from '../../ports/logger'
import { IDiscountRepository } from '../../repositories/discount.repository'
import { Discount } from '../../entities/discount'

/**
 * Change an example name by id UseCase
 * @namespace Example
 */
export class UpdateDiscountPercentage {
  private readonly repository: IDiscountRepository
  public readonly logger: ILogger

  constructor(repository: IDiscountRepository, logger: ILogger) {
    this.repository = repository
    this.logger = logger
  }

  /**
   * UseCase executer
   *
   * @param id - User id beloging the discount
   * @param percentage - New percentage
   * @returns The discount updated
   */
  async execute(userId: string, newPercentage: number): Promise<Discount> {
    this.logger.info(`Changing the percentage of the discount from user ${userId} to ${newPercentage}`)
    // REPOSITORY
    // Retrieve the entity with all data
    const discount = await this.repository.getByUserIdFromDate(userId, new Date())

    // BUSINESS EXCEPTIONS
    if (!discount) throw new NotFoundError()
    // ENTITY LOGIC
    // Change only the necessary field in the useCase
    discount.updatePercentage(newPercentage)
    discount.updatedAt = new Date()
    // REPOSITORY
    // Update the entity
    await this.repository.update(discount)

    this.logger.info(`Changed the percentage from the discount from user ${userId}`)
    return discount
  }
}

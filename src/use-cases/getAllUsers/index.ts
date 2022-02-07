import { ILogger } from '../../ports/logger'
import { IUserRepository } from '../../repositories/user.repository'
import { User } from '../../entities/user'

/**
 * Get all users UseCase
 * @namespace User
 */
export class GetAllUsers {
  private readonly repository: IUserRepository
  public readonly logger: ILogger

  constructor(repository: IUserRepository, logger: ILogger) {
    this.repository = repository
    this.logger = logger
  }

  /**
   * UseCase executer
   *
   * @returns All the users
   */
  async execute(): Promise<User[]> {
    this.logger.info('Retrieving the users')
    return this.repository.getAll()
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '../../src/entities/user'
import { IUserRepository } from '../../src/repositories/user.repository'

export class FakeUserRepository implements IUserRepository {
  getByEmail(email: string): Promise<User | undefined> {
    throw new Error('Method not implemented.')
  }

  save(user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getAll(): Promise<User[]> {
    return Promise.resolve([])
  }
}

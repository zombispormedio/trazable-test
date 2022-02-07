// PORTS => THE PORTS ARE INTERFACES IMPLEMENTED BY THE ADAPTERS
// These interfaces is all of the business logic know, business logic dont know the implementation.
// The implementation must return the data defined here.

import { User } from '../entities/user'

// REPOSITORY
// This interface (secondary port) follow the repository pattern instead the hexagonal architecture naming.
export interface IUserRepository {
  /**
   * Save an user
   *
   * @param user- New User to create
   */
  save(user: User): Promise<void>

  /**
   * Get a user by email
   *
   * @return The user that match
   */
  getByEmail(email: string): Promise<User | undefined>

  /**
   * Get all users
   *
   * @return All users
   */
  getAll(): Promise<User[]>
}

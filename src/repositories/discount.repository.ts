// PORTS => THE PORTS ARE INTERFACES IMPLEMENTED BY THE ADAPTERS
// These interfaces is all of the business logic know, business logic dont know the implementation.
// The implementation must return the data defined here.

import { Discount } from '../entities/discount'

// REPOSITORY
// This interface (secondary port) follow the repository pattern instead the hexagonal architecture naming.
export interface IDiscountRepository {
  /**
   * Save an discount
   *
   * @param discount - New Discount to create
   */
  save(discount: Discount): Promise<void>

  /**
   * Get an discount by userId from date
   *
   * @return The discount that match
   */
  getByUserIdFromDate(userId: string, from: Date): Promise<Discount | undefined>

  /**
   * Update an discount
   */
  update(discount: Discount): Promise<void>
}

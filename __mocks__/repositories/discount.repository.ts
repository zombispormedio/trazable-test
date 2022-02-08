/* eslint-disable @typescript-eslint/no-unused-vars */
import { Discount } from '../../src/entities/discount'
import { IDiscountRepository } from '../../src/repositories/discount.repository'

export class FakeDiscountRepository implements IDiscountRepository {
  save(discount: Discount): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getByUserIdFromDate(userId: string, from: Date): Promise<Discount | undefined> {
    throw new Error('Method not implemented.')
  }

  update(discount: Discount): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

const DEFAULT_DISCOUNT_VALUE = 10

const DEFAULT_EXPIRATION_MILLIS = 1000 * 60 * 60 * 24 * 30 // 30 days

export interface IDiscount {
  _id: string
  userId: string
  percentage?: number
  expiresAt?: Date
  updatedAt: Date
  readonly createdAt: Date
}
export class Discount implements IDiscount {
  readonly _id: string
  userId: string
  percentage: number
  expiresAt: Date
  updatedAt: Date
  readonly createdAt: Date

  static isValidPercentage(percentage?: number): boolean {
    return !!percentage && percentage >= 0 && percentage <= 100
  }

  constructor({ _id, userId, updatedAt, expiresAt, createdAt, percentage }: IDiscount) {
    this._id = _id
    this.userId = userId
    this.percentage = percentage || DEFAULT_DISCOUNT_VALUE
    this.expiresAt = expiresAt || new Date(new Date().getTime() + DEFAULT_EXPIRATION_MILLIS)

    this.updatedAt = updatedAt
    this.createdAt = createdAt
  }

  updatePercentage(percentage: number): void {
    this.percentage = percentage
    this.updatedAt = new Date()
  }
}

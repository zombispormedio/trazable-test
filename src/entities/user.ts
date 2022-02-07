import * as joi from 'joi'
import { IDiscount } from './discount'

export interface IUser {
  _id: string
  name: string
  email: string
  discounts?: IDiscount[]
  updatedAt: Date
  readonly createdAt: Date
}
export class User implements IUser {
  readonly _id: string
  name: string
  email: string
  discounts?: IDiscount[] | undefined
  updatedAt: Date
  readonly createdAt: Date

  static isValidEmail(email: string): boolean {
    return !joi.string().email().validate(email).error
  }

  constructor({ _id, name, email, updatedAt, createdAt }: IUser) {
    this._id = _id
    this.name = name
    this.email = email
    this.updatedAt = updatedAt
    this.createdAt = createdAt
  }

  setDiscounts(discounts: IDiscount[]): void {
    this.discounts = discounts
  }
}

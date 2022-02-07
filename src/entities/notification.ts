export interface INotification {
  _id: string
  userId: string
  message: string
  readonly createdAt: Date
}
export class Notification implements INotification {
  readonly _id: string
  userId: string
  message: string
  readonly createdAt: Date

  constructor({ _id, message, userId, createdAt }: INotification) {
    this._id = _id
    this.userId = userId
    this.message = message
    this.createdAt = createdAt
  }
}

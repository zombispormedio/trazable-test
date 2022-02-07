import { IUser, User } from '../../../entities/user'

/**
 *
 */
export class UserDTO {
  private readonly user: User

  constructor(user: User) {
    this.user = user
  }

  toJSON(): Pick<IUser, '_id' | 'name' | 'email'> {
    return {
      _id: this.user._id,
      name: this.user.name,
      email: this.user.email,
    }
  }
}

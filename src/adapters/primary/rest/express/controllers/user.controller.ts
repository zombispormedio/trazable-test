import { Request, Response } from 'express'

import { StatusCodes } from 'http-status-codes'

import { ManageError } from '../manage-error'
import { CreateUser } from '../../../../../use-cases/createUser'
import { UpdateDiscountPercentage } from '../../../../../use-cases/updateDiscountPercentage'
import { GetAllNotifications } from '../../../../../use-cases/getAllNotifications'
import { NotificationDTO } from '../../../DTOs/notification.dto'
import { GetAllUsers } from '../../../../../use-cases/getAllUsers'
import { UserDTO } from '../../../DTOs/user.dto'

// This secondary adapter calls directly the useCases.
export class UserController {
  private readonly createUserUseCase: CreateUser
  private readonly getAllUsersUseCase: GetAllUsers
  private readonly updateDiscountPercentageUseCase: UpdateDiscountPercentage
  private readonly getAllNotificationsUseCase: GetAllNotifications

  constructor(
    createUserUseCase: CreateUser,
    getAllUsersUseCase: GetAllUsers,
    updateDiscountPercentageUseCase: UpdateDiscountPercentage,
    getAllNotificationsUseCase: GetAllNotifications
  ) {
    this.createUserUseCase = createUserUseCase
    this.getAllUsersUseCase = getAllUsersUseCase
    this.updateDiscountPercentageUseCase = updateDiscountPercentageUseCase
    this.getAllNotificationsUseCase = getAllNotificationsUseCase
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const user = req.body
    try {
      this.createUserUseCase.logger.setCorrelationId(req.headers?.['correlation-id'])
      await this.createUserUseCase.execute(user)
      res.status(StatusCodes.CREATED).end()
    } catch (error) {
      ManageError(error, res, this.createUserUseCase.logger)
    }
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute()
      const usersDTO = users.map(user => new UserDTO(user))
      usersDTO.length > 0 ? res.status(StatusCodes.OK).json(usersDTO) : res.status(StatusCodes.NO_CONTENT).end()
    } catch (error) {
      ManageError(error, res, this.getAllNotificationsUseCase.logger)
    }
  }

  getAllNotifications = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params
    try {
      const notifications = await this.getAllNotificationsUseCase.execute(userId)
      const notificationsDTO = notifications.map(notification => new NotificationDTO(notification))
      notificationsDTO.length > 0
        ? res.status(StatusCodes.OK).json(notificationsDTO)
        : res.status(StatusCodes.NO_CONTENT).end()
    } catch (error) {
      ManageError(error, res, this.getAllNotificationsUseCase.logger)
    }
  }

  updateCurrentDiscountPercentage = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params
    const { percentage } = req.body
    try {
      await this.updateDiscountPercentageUseCase.execute(userId, percentage)
      res.status(StatusCodes.OK).end()
    } catch (error) {
      ManageError(error, res, this.updateDiscountPercentageUseCase.logger)
    }
  }
}

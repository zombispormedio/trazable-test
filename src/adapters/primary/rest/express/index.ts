import express, { Express } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import { StatusCodes } from 'http-status-codes'

import { UserController } from './controllers/user.controller'
import { ILogger } from '../../../../ports/logger'
import { AuthenticationMiddleware } from './middlewares/authentication'
import { IAuth } from '../../../../ports/auth'
import { CreateUser } from '../../../../use-cases/createUser'
import { UpdateDiscountPercentage } from '../../../../use-cases/updateDiscountPercentage'
import { GetAllNotifications } from '../../../../use-cases/getAllNotifications'
import { GetAllUsers } from '../../../../use-cases/getAllUsers'
interface IExpressAPIOptions {
  logger: ILogger
  auth: IAuth
}

/*
 * Express configuration
 */
export class ExpressApi {
  private readonly createUser: CreateUser
  private readonly getAllUsersUseCase: GetAllUsers
  private readonly updateDiscountPercentageUseCase: UpdateDiscountPercentage
  private readonly getAllNotificationsUseCase: GetAllNotifications
  private readonly logger: ILogger
  private readonly app: Express
  private readonly auth: IAuth
  private readonly authMiddleware: AuthenticationMiddleware

  constructor(
    createUser: CreateUser,
    getAllUsersUseCase: GetAllUsers,
    updateDiscountPercentageUseCase: UpdateDiscountPercentage,
    getAllNotificationsUseCase: GetAllNotifications,
    options: IExpressAPIOptions
  ) {
    this.createUser = createUser
    this.getAllUsersUseCase = getAllUsersUseCase
    this.updateDiscountPercentageUseCase = updateDiscountPercentageUseCase
    this.getAllNotificationsUseCase = getAllNotificationsUseCase

    this.auth = options.auth

    this.logger = options.logger

    this.app = express()
    this.authMiddleware = new AuthenticationMiddleware(this.auth)
    this.serverConfiguration()
    this.setupRoutes()
  }

  /**
   * Start the express server api
   *
   * @param port - Public port on serve the api
   */
  start(port: string): void {
    this.app.listen(port, () => {
      this.logger.info(`App listening on port ${port} `)
    })
  }

  /**
   * Setup server configuration middlewares
   */
  private serverConfiguration(): void {
    this.app.use(express.json())
    this.app.use(helmet())
    this.app.use(
      morgan('combined', {
        stream: {
          write: text => {
            this.logger.info(text)
          },
        },
      })
    )
  }

  /**
   * Setup server routes
   */
  private setupRoutes() {
    const router = express.Router()

    // Ping route
    router.route('/ping').get((req, res) => {
      res.status(StatusCodes.OK).end()
    })

    const userController = new UserController(
      this.createUser,
      this.getAllUsersUseCase,
      this.updateDiscountPercentageUseCase,
      this.getAllNotificationsUseCase
    )

    router
      .route('/users/')
      .post(this.authMiddleware.authenticate, userController.create)
      .get(this.authMiddleware.authenticate, userController.getAll)

    router
      .route('/users/:userId/notifications')
      .get(this.authMiddleware.authenticate, userController.getAllNotifications)

    router
      .route('/users/:userId/current-discount-percentage')
      .patch(this.authMiddleware.authenticate, userController.updateCurrentDiscountPercentage)

    this.app.use(router)
  }
}

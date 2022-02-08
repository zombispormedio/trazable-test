/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import expect from 'expect'
import { GetAllNotifications } from '.'
import sinon from 'sinon'
import { ILogger } from '../../ports/logger'
import { Notification } from '../../entities/notification'
import ExampleDataInJSON from '../../../__mocks__/example/getAllNotifications/example-data-in.json'
import ExampleDataOutJSON from '../../../__mocks__/example/getAllNotifications/example-data-out.json'
import { FakeNotificationRepository } from '../../../__mocks__/repositories/notification.repository'
import { FakeLogger } from '../../../__mocks__/ports/logger'

describe('getAllNotifications use-case', () => {
  const now = new Date('2000-01-01')

  beforeEach(() => {
    sinon.restore()
  })

  it('should get all notifications successfully', async () => {
    sinon
      .stub(FakeNotificationRepository.prototype, 'getAllByUserId')
      .resolves(ExampleDataOutJSON.map(example => new Notification({ ...example, createdAt: now })))
    sinon.stub(FakeLogger.prototype, 'info')
    const useCase = new GetAllNotifications(new FakeNotificationRepository(), new FakeLogger())

    const notifications = await useCase.execute(ExampleDataInJSON.userId)

    expect(notifications.map(example => ({ ...example }))).toStrictEqual(
      ExampleDataOutJSON.map(example => ({ ...example, createdAt: now }))
    )
  })
})

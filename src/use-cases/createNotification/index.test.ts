/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import expect from 'expect'
import { CreateNotification } from '.'
import sinon, { SinonFakeTimers } from 'sinon'

import { FakeIdGenerator } from '../../../__mocks__/ports/id-generator'

import { FakeLogger } from '../../../__mocks__/ports/logger'
import { FakeNotificationRepository } from '../../../__mocks__/repositories/notification.repository'
import { USER_CREATED_EVENT } from '../../constants'
import ExampleDataInJSON from '../../../__mocks__/example/createNotification/example-data-in.json'
import ExampleDataOutJSON from '../../../__mocks__/example/createNotification/example-data-out.json'

describe('createNotification use-case', () => {
  const now = new Date('2000-01-01')
  let clock: SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime())
  })

  afterEach(() => {
    clock.restore()
    sinon.restore()
  })

  it('should create a new notification successfully', async () => {
    const stubSave = sinon.stub(FakeNotificationRepository.prototype, 'save')
    sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    sinon.stub(FakeLogger.prototype, 'info')
    const createNotificationUseCase = new CreateNotification(
      new FakeNotificationRepository(),
      new FakeLogger(),
      new FakeIdGenerator()
    )
    const result = await createNotificationUseCase.execute(USER_CREATED_EVENT, ExampleDataInJSON.userId)
    expect(stubSave.called).toBeTruthy()
    expect({ ...result }).toStrictEqual({ ...ExampleDataOutJSON, createdAt: now })
  })

  it('should not create a notification when event is unknown', async () => {
    sinon.stub(FakeLogger.prototype, 'info')
    const createNotificationUseCase = new CreateNotification(
      new FakeNotificationRepository(),
      new FakeLogger(),
      new FakeIdGenerator()
    )

    const result = await createNotificationUseCase.execute('example', ExampleDataInJSON.userId)

    expect(result).toBeUndefined()
  })
})

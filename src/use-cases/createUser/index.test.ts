/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import expect from 'expect'
import { CreateUser } from '.'
import sinon, { SinonFakeTimers } from 'sinon'

import { FakeIdGenerator } from '../../../__mocks__/ports/id-generator'
import { FakeQueue } from '../../../__mocks__/ports/queue'
import { FakeLogger } from '../../../__mocks__/ports/logger'
import { FakeUserRepository } from '../../../__mocks__/repositories/user.repository'

import ExampleDataInJSON from '../../../__mocks__/example/createUser/example-data-in.json'
import ExampleDataOutJSON from '../../../__mocks__/example/createUser/example-data-out.json'

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

  it('should create a new example successfully', async () => {
    const stubSave = sinon.stub(FakeUserRepository.prototype, 'save')

    const stubGetByEmail = sinon.stub(FakeUserRepository.prototype, 'getByEmail').resolves()
    sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    const stubPublish = sinon.stub(FakeQueue.prototype, 'publish').resolves()
    sinon.stub(FakeLogger.prototype, 'info')

    const createUserUseCase = new CreateUser(
      new FakeUserRepository(),
      new FakeLogger(),
      new FakeIdGenerator(),
      new FakeQueue()
    )

    const result = await createUserUseCase.execute(ExampleDataInJSON)

    expect(stubGetByEmail.called).toBeTruthy()

    expect(stubSave.called).toBeTruthy()

    expect({ ...result }).toStrictEqual({ ...ExampleDataOutJSON, createdAt: now, updatedAt: now })

    expect(stubPublish.called).toBeTruthy()
  })

  it('should fail creating a new example with invalid email', async () => {
    sinon.stub(FakeUserRepository.prototype, 'save')

    sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    sinon.stub(FakeQueue.prototype, 'publish').resolves()
    sinon.stub(FakeLogger.prototype, 'info')

    const useCase = new CreateUser(new FakeUserRepository(), new FakeLogger(), new FakeIdGenerator(), new FakeQueue())

    expect(
      useCase.execute({
        ...ExampleDataInJSON,
        email: 'invalid-email',
      })
    ).rejects.toThrow()
  })
})

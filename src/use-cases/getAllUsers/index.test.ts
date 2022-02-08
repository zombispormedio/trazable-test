/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import expect from 'expect'
import { GetAllUsers } from '.'
import sinon from 'sinon'
import { User } from '../../entities/user'

import ExampleDataOutJSON from '../../../__mocks__/example/getAllUsers/example-data-out.json'
import { FakeUserRepository } from '../../../__mocks__/repositories/user.repository'
import { FakeLogger } from '../../../__mocks__/ports/logger'

describe('GetAllUsers use-case', () => {
  const now = new Date('2000-01-01')

  beforeEach(() => {
    sinon.restore()
  })

  it('should get all examples successfully', async () => {
    sinon
      .stub(FakeUserRepository.prototype, 'getAll')
      .resolves(ExampleDataOutJSON.map(example => new User({ ...example, createdAt: now, updatedAt: now })))
    sinon.stub(FakeLogger.prototype, 'info')
    const getAllUseCase = new GetAllUsers(new FakeUserRepository(), new FakeLogger())

    const examples = await getAllUseCase.execute()

    expect(examples.map(example => ({ ...example }))).toStrictEqual(
      ExampleDataOutJSON.map(example => ({ ...example, createdAt: now, updatedAt: now }))
    )
  })
})

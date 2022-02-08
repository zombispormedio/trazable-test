/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import expect from 'expect'
import { ApplyDiscountToUser } from '.'
import sinon, { SinonFakeTimers } from 'sinon'

import ExampleDataInJSON from '../../../__mocks__/example/applyDiscountToUser/example-data-in.json'
import ExampleDataOutJSON from '../../../__mocks__/example/applyDiscountToUser/example-data-out.json'
import { FakeIdGenerator } from '../../../__mocks__/ports/id-generator'
import { FakeLogger } from '../../../__mocks__/ports/logger'
import { FakeDiscountRepository } from '../../../__mocks__/repositories/discount.repository'

describe('applyDiscountToUser use-case', () => {
  const now = new Date('2000-01-01')
  const endMonth = new Date('2000-01-31')
  let clock: SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime())
  })

  afterEach(() => {
    clock.restore()
    sinon.restore()
  })

  it('should apply discount successfully', async () => {
    const stubSave = sinon.stub(FakeDiscountRepository.prototype, 'save')

    sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    sinon.stub(FakeLogger.prototype, 'info')

    const useCase = new ApplyDiscountToUser(new FakeDiscountRepository(), new FakeLogger(), new FakeIdGenerator())

    const result = await useCase.execute({ ...ExampleDataInJSON, createdAt: now, updatedAt: now })

    expect({ ...result }).toStrictEqual({ ...ExampleDataOutJSON, expiresAt: endMonth, createdAt: now, updatedAt: now })

    expect(stubSave.called).toBeTruthy()
  })
})

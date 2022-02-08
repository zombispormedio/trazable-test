/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import expect from 'expect'
import { UpdateDiscountPercentage } from '.'
import { Discount } from '../../entities/discount'
import sinon, { SinonFakeTimers } from 'sinon'
import { FakeQueue } from '../../../__mocks__/ports/queue'
import ExampleDataInJSON from '../../../__mocks__/example/updateDiscountPercentage/example-data-in.json'
import ExampleDataOutJSON from '../../../__mocks__/example/updateDiscountPercentage/example-data-out.json'
import { FakeLogger } from '../../../__mocks__/ports/logger'
import { FakeDiscountRepository } from '../../../__mocks__/repositories/discount.repository'

describe('updateDiscountPercentage use-case', () => {
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

  it('should update the discount successfully', async () => {
    const stubGet = sinon
      .stub(FakeDiscountRepository.prototype, 'getByUserIdFromDate')
      .resolves(new Discount({ ...ExampleDataOutJSON, createdAt: now, updatedAt: now }))

    const stubUpdate = sinon.stub(FakeDiscountRepository.prototype, 'update').resolves()
    const stubPublish = sinon.stub(FakeQueue.prototype, 'publish').resolves()

    const useCase = new UpdateDiscountPercentage(new FakeDiscountRepository(), new FakeLogger(), new FakeQueue())

    const result = await useCase.execute(ExampleDataInJSON.userId, ExampleDataInJSON.percentage)

    expect({ ...result }).toStrictEqual({ ...ExampleDataOutJSON, expiresAt: endMonth, createdAt: now, updatedAt: now })

    expect(stubGet.called).toBeTruthy()
    expect(stubUpdate.called).toBeTruthy()
    expect(stubPublish.called).toBeTruthy()
  })

  it('should fail updating the discount with incorrect parameters', async () => {
    const stubGet = sinon
      .stub(FakeDiscountRepository.prototype, 'getByUserIdFromDate')
      .resolves(new Discount({ ...ExampleDataOutJSON, createdAt: now, updatedAt: now }))
    sinon.stub(FakeLogger.prototype, 'info')

    const useCase = new UpdateDiscountPercentage(new FakeDiscountRepository(), new FakeLogger(), new FakeQueue())

    expect(useCase.execute(ExampleDataInJSON.userId, 3000)).rejects.toThrow()

    expect(stubGet.called).toBeFalsy()
  })
})

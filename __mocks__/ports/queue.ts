/* eslint-disable @typescript-eslint/no-unused-vars */

import { IQueue } from '../../src/ports/queue'

export class FakeQueue implements IQueue {
  createTopicIfNotExists(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  publish(message: string): Promise<string | undefined> {
    throw new Error('Method not implemented.')
  }
}

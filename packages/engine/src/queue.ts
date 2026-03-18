import PQueue from 'p-queue'

export class JobQueue {
  private queue: PQueue

  constructor(concurrency = 1) {
    this.queue = new PQueue({ concurrency })
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return this.queue.add(fn) as Promise<T>
  }

  get size(): number {
    return this.queue.size
  }

  get pending(): number {
    return this.queue.pending
  }

  pause(): void {
    this.queue.pause()
  }

  start(): void {
    this.queue.start()
  }

  clear(): void {
    this.queue.clear()
  }
}

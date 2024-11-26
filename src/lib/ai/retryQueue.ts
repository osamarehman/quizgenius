import { RetryOptions, safeAIOperation } from './errorHandling'

interface QueueItem<T> {
  operation: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
  retryCount: number
  maxRetries: number
}

export class RetryQueue {
  private queue: QueueItem<unknown>[] = []
  private processing = false
  private concurrentLimit: number
  private retryOptions: Partial<RetryOptions>

  constructor(
    concurrentLimit = 3,
    retryOptions: Partial<RetryOptions> = {}
  ) {
    this.concurrentLimit = concurrentLimit
    this.retryOptions = retryOptions
  }

  async add<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        resolve,
        reject,
        retryCount: 0,
        maxRetries
      })

      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const batch = this.queue.splice(0, this.concurrentLimit)

    try {
      await Promise.all(
        batch.map(item => this.processItem(item))
      )
    } finally {
      this.processing = false
      if (this.queue.length > 0) {
        this.processQueue()
      }
    }
  }

  private async processItem<T>(item: QueueItem<T>) {
    try {
      const result = await safeAIOperation(
        item.operation,
        this.retryOptions
      )
      item.resolve(result)
    } catch (error) {
      if (item.retryCount < item.maxRetries) {
        item.retryCount++
        this.queue.push(item)
      } else {
        item.reject(error)
      }
    }
  }

  clear() {
    this.queue = []
  }

  get size() {
    return this.queue.length
  }

  get isProcessing() {
    return this.processing
  }
} 
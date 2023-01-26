export default class JobQueue {
  constructor() {
    this.queue = []
    this.working = false
  }

  push(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({fn: fn, resolve: resolve, reject: reject})
      if (!this.working) {
        this.work().catch(e => console.error(e))
      }
    })
  }

  async work() {
    this.working = true
    while (this.queue.length > 0) {
      const job = this.queue.shift()
      try {
        const result = await job.fn()
        job.resolve(result)
      } catch (e) {
        if (job.reject) job.reject(e)
      }
    }
    this.working = false
  }
}

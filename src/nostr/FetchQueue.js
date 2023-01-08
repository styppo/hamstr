import {Observable} from 'src/nostr/utils'

export default class FetchQueue extends Observable {
  constructor(client, subId, fnGetId, fnCreateFilter, opts = {}) {
    super()
    this.client = client
    this.subId = subId
    this.fnGetId = fnGetId
    this.fnCreateFilter = fnCreateFilter
    this.throttle = opts.throttle || 250
    this.batchSize = opts.batchSize || 20
    this.retryDelay = opts.retryDelay || 3000
    this.maxRetries = opts.maxRetries || 3

    this.queue = {}
    this.failed = {}
    this.fetching = false
    this.fetchQueued = false
    this.retryInterval = null
  }

  add(id) {
    if (!id) throw new Error(`invalid id ${id}`)

    if (this.queue[id] !== undefined) return
    if (this.failed[id]) return // TODO improve this
    this.queue[id] = 0

    if (!this.fetching) {
      this.fetch()
    } else if (!this.fetchQueued) {
      setTimeout(this.fetch.bind(this), this.throttle)
      this.fetchQueued = true
    }
  }

  fetch() {
    this.fetchQueued = false
    if (this.retryInterval) clearInterval(this.retryInterval)

    const ids = Object.keys(this.queue).slice(0, this.batchSize)
    if (!ids.length) return

    console.log(`Fetching ${ids.length} ${this.subId}s`, ids)

    // Remove ids that we have tried too many times.
    const filteredIds = []
    for (const id of ids) {
      this.queue[id]++
      if (this.queue[id] > this.maxRetries) {
        console.warn(`Failed to fetch ${this.subId} ${id}`)
        this.failed[id] = true
        delete this.queue[id]
      } else {
        filteredIds.push(id)
      }
    }
    if (!filteredIds.length) return

    this.fetching = true
    this.retryInterval = setInterval(this.fetch.bind(this), this.retryDelay)

    // XXX Needed for some relays?
    this.client.unsubscribe(this.subId)

    this.client.subscribe(
      this.fnCreateFilter(filteredIds),
      (event, relay, subId) => {
        const id = this.fnGetId(event)
        delete this.queue[id]
        filteredIds.splice(filteredIds.indexOf(id), 1)

//        console.log(`Fetched ${this.subId} ${id}, ${filteredIds.length} remaining`)

        this.emit('event', event, relay)

        if (Object.keys(this.queue).length === 0) {
//          console.log(`Fetched all ${this.subId}s`)
          if (this.retryInterval) clearInterval(this.retryInterval)
          this.client.unsubscribe(subId)
          this.fetching = false
        } else if (filteredIds.length === 0) {
//          console.log(`Batch ${this.subId} fetched, requesting more (${Object.keys(this.queue).length} remain)`)
          this.fetch()
        }
      },
      {
        subId: this.subId,
      }
    )
  }
}

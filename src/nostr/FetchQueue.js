import {Observable} from 'src/nostr/Observable'

export default class FetchQueue extends Observable {
  constructor(client, subId, fnGetId, fnCreateFilter, opts = {}) {
    super()
    this.client = client
    this.subId = subId
    this.sub = null
    this.fnGetId = fnGetId
    this.fnCreateFilter = fnCreateFilter
    this.throttle = opts.throttle || 250
    this.batchSize = opts.batchSize || 250
    this.timeout = opts.timeout || 3000
    this.maxAttempts = opts.maxAttempts || 2

    this.queue = {}
    this.failed = {}
    this.fetching = false
    this.fetchQueued = false
    this.fetchTimeout = null
  }

  add(id) {
    if (!id) throw new Error(`invalid id ${id}`)

    if (this.queue[id] !== undefined) return
    if (this.failed[id]) return // TODO improve this
    this.queue[id] = 0

    if (!this.fetching && !this.fetchQueued) {
      setTimeout(this.fetch.bind(this), this.throttle)
      this.fetchQueued = true
    }
  }

  fetch() {
    this.fetchQueued = false
    if (this.fetchTimeout) clearTimeout(this.fetchTimeout)

    const ids = Object.keys(this.queue).slice(0, this.batchSize)
    if (!ids.length) {
      this.fetching = false
      return
    }

    // Remove ids that we have tried too many times.
    const filteredIds = []
    for (const id of ids) {
      this.queue[id]++
      if (this.queue[id] > this.maxAttempts) {
        console.warn(`Failed to fetch ${this.subId} ${id}`)
        this.failed[id] = true
        delete this.queue[id]
      } else {
        filteredIds.push(id)
      }
    }

    if (!filteredIds.length) {
      this.fetching = false
      return
    }

    console.log(`Fetching ${this.subId}s ${filteredIds.length}/${Object.keys(this.queue).length} `)

    this.fetching = true
    this.fetchTimeout = setTimeout(this.fetch.bind(this), this.timeout)

    // XXX Needed for some relays?
    //this.client.unsubscribe(this.subId)

    const sub = this.client.subscribe(this.fnCreateFilter(filteredIds), this.subId)
    sub.on('event', (event, relay, subId) => {
      const id = this.fnGetId(event)
      if (!this.queue[id]) return

      delete this.queue[id]
      filteredIds.splice(filteredIds.indexOf(id), 1)

      // console.log(`Fetched ${this.subId} ${id}, ${filteredIds.length} remaining`)

      this.emit('event', event, relay)

      if (Object.keys(this.queue).length === 0) {
        if (this.fetchTimeout) clearTimeout(this.fetchTimeout)
        this.fetching = false
        sub.close()
      } else if (filteredIds.length === 0) {
        this.fetch()
      }
    })
    sub.on('end', () => {
      if (this.fetching && Object.keys(this.queue).length > 0) {
        this.fetch()
      } else {
        console.log('[COMPLETE]', this)
        if (this.fetchTimeout) clearTimeout(this.fetchTimeout)
        this.fetching = false
        sub.close()
      }
    })
    sub.on('close', () => {
      if (this.fetching && Object.keys(this.queue).length > 0) {
        this.fetch()
      }
    })
  }
}

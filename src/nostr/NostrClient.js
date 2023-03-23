import RelayPool from 'src/nostr/RelayPool'
import {CloseAfter} from 'src/nostr/Relay'

export default class NostrClient {
  constructor(relays) {
    this.pool = new RelayPool(relays)
    this.pool.on('notice', this.onNotice.bind(this))
    this.pool.on('ok', this.onOk.bind(this))
    window.clientSubscribe = this.subscribe.bind(this)
  }

  connect() {
    this.pool.connect()
  }

  disconnect() {
    this.pool.disconnect()
  }

  connectedRelays() {
    return this.pool.connectedRelays()
  }

  isConnectedTo(url) {
    // TODO remove linear scan
    return this.connectedRelays().some(relay => relay.url === url)
  }

  subscribe(filters, subId = null, closeAfter = CloseAfter.NEVER) {
    return this.pool.subscribe(filters, subId, closeAfter)
  }

  unsubscribe(subId) {
    this.pool.unsubscribe(subId)
  }

  publish(event) {
    return this.pool.publish(event)
  }

  fetch(filters, opts = {}) {
    return new Promise(resolve => {
      const events = {}
      const sub = this.pool.subscribe(filters, opts.subId, CloseAfter.EOSE)
      const timer = setTimeout(() => {
        sub.close()
        resolve(Object.values(events))
      }, opts.timeout || 4000)
      sub.on('event', event => {
        events[event.id] = event
      })
      sub.on('end', () => {
        sub.close()
        clearTimeout(timer)
        resolve(Object.values(events))
      })
      sub.on('close', () => {
        clearTimeout(timer)
        resolve(Object.values(events))
      })
    })
  }

  stream(filters, eventCallback, endCallback = () => {}, opts = {}) {
    const events = {}
    const sub = this.pool.subscribe(filters, opts.subId)
    const timer = setTimeout(() => {
      endCallback(Object.values(events))
    }, opts.timeout || 4000)
    sub.on('event', event => {
      events[event.id] = event
    })
    sub.on('end', () => {
      clearTimeout(timer)
      endCallback(Object.values(events))
    })
    return sub
  }

  onNotice(relay, message) {
    console.warn(`[NOTICE] from ${relay}: ${message}`)
  }

  onOk(relay, eventId, wasSaved, message) {
    console.log(`[OK] from ${relay}: eventId=${eventId}, wasSaved=${wasSaved}, message=${message}`)
  }
}

import RelayPool from 'src/nostr/RelayPool'
import {CloseAfter} from 'src/nostr/Relay'

export default class NostrClient {
  constructor(relays) {
    this.pool = new RelayPool(relays)
    this.pool.on('notice', this.onNotice.bind(this))
    this.pool.on('ok', this.onOk.bind(this))
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

  subscribe(filters, subId = null) {
    return this.pool.subscribe(filters, subId)
  }

  unsubscribe(subId) {
    this.pool.unsubscribe(subId)
  }

  publish(event) {
    return this.pool.publish(event)
  }

  // fetchSingle(filters) {
  //   const filtersWithLimit = Object.assign({}, filters, {limit: 1})
  //   return new Promise(resolve => {
  //     const sub = this.pool.subscribe(filters)
  //     sub.on('event')
  //     this.client.subscribe(
  //       filtersWithLimit,
  //       (event, relay) => {
  //         resolve(this.addEvent(event, relay))
  //       },
  //       {
  //         closeAfter: 'single'
  //       }
  //     )
  //   })
  // }

  fetchMultiple(filters, limit = 100, timeout = 5000) {
    return new Promise(resolve => {
      const objects = {}
      const filtersWithLimit = Object.assign({}, filters, {limit})
      const sub = this.pool.subscribe(filtersWithLimit, null, CloseAfter.EOSE)
      const timer = setTimeout(() => {
        sub.close()
        resolve(objects)
      }, timeout)
      sub.on('event', event => {
        objects[event.id] = event
        if (Object.keys(objects).length >= limit) {
          clearTimeout(timer)
          sub.close()
          resolve(objects)
        }
      })
      sub.on('close', () => {
        clearTimeout(timer)
        resolve(objects)
      })
    })
  }

  onNotice(relay, message) {
    console.warn(`[NOTICE] from ${relay}: ${message}`)
  }

  onOk(relay, eventId, wasSaved, message) {
    console.log(`[OK] from ${relay}: eventId=${eventId}, wasSaved=${wasSaved}, message=${message}`)
  }
}

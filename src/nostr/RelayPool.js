import {CloseAfter, Relay} from 'src/nostr/Relay'
import {Observable} from 'src/nostr/utils'

class MultiSubscription extends Observable {
  constructor(subId, subs) {
    super()
    this.subId = subId
    this.subs = {}
    for (const sub of subs) {
      this.subs[sub.relay] = sub
      this.setupListeners(sub)
    }
  }

  setupListeners(sub) {
    sub.on('event', this.emit.bind(this, 'event'))
    sub.on('eose', this.onEose.bind(this))
    sub.on('close', this.onClose.bind(this))
  }

  add(sub) {
    console.assert(sub.subId === this.subId, 'invalid subId')
    this.subs[sub.relay] = sub
    this.setupListeners(sub)
  }

  close(relay = null) {
    if (relay) {
      if (this.subs[relay]) this.subs[relay].close()
      return
    }

    for (const sub of Object.values(this.subs)) {
      sub.close()
    }
  }

  onEose(relay) {
    const sub = this.subs[relay]
    if (!sub) return

    // still needed?
    this.emit('eose', relay, this.subId)

    if (!sub.eoseSeen) {
      sub.eoseSeen = true
      if (Object.values(this.subs).every(sub => sub.eoseSeen)) {
        this.emit('end', this.subId)
      }
    }
  }

  onClose(relay) {
    delete this.subs[relay]
    if (Object.keys(this.subs).length === 0) {
      this.emit('close', this.subId)
    }
  }
}

export default class ReplayPool extends Observable {
  constructor(urls, minRelays = 5) {
    super()

    this.relays = {}
    this.minRelays = Math.min(minRelays, urls.length)

    this.subs = {}
    this.nextSubId = 0

    for (const url of urls) {
      this.add(url)
    }
  }

  add(url) {
    if (this.relays[url]) return

    const relay = new Relay(url)
    relay.on('open', this.onOpen.bind(this))
    relay.on('close', this.emit.bind(this, 'close', relay))

    relay.on('event', this.emit.bind(this, 'event', relay))
    relay.on('eose', this.emit.bind(this, 'eose', relay))
    relay.on('notice', this.emit.bind(this, 'notice', relay))
    relay.on('ok', this.emit.bind(this, 'ok', relay))

    this.relays[url] = relay
  }

  remove(url) {
    const relay = this.relays[url]
    if (!relay) return
    relay.disconnect()
    delete this.relays[url]
  }

  publish(event) {
    for (const relay of this.connectedRelays()) {
      relay.publish(event)
    }
  }

  subscribe(filters, subId = null, closeAfter = CloseAfter.NEVER) {
    if (!subId) subId = `sub${this.nextSubId++}`
    console.log(`[SUBSCRIBE] ${subId}`, filters)

    const sub = new MultiSubscription(subId, [])
    sub.on('close', this.unsubscribe.bind(this, subId))

    this.subs[subId] = {sub, filters, closeAfter}
    const connectedRelays = this.connectedRelays()
    if (connectedRelays.length >= this.minRelays) {
      for (const relay of connectedRelays) {
        sub.add(relay.subscribe(filters, subId, closeAfter))
      }
    } else {
      this.subs[subId].pending = true
    }

    return sub
  }

  unsubscribe(subId) {
    const sub = this.subs[subId]
    if (!sub) return
    console.log(`[UNSUBSCRIBE] ${subId}`)
    sub.sub.close()
    delete this.subs[subId]
  }

  connect() {
    for (const relay of Object.values(this.relays)) {
      relay.connect()
    }
  }

  disconnect() {
    for (const relay of Object.values(this.relays)) {
      relay.disconnect()
    }
  }

  connectedRelays() {
    return Object.values(this.relays).filter(relay => relay.isConnected())
  }

  numConnectedRelays() {
    return this.connectedRelays().length
  }

  onOpen(relay) {
    console.log(`[RELAY] Connected to ${relay}`)

    for (const subId of Object.keys(this.subs)) {
      const sub = this.subs[subId]
      const connectedRelays = this.connectedRelays()
      if (connectedRelays.length >= this.minRelays) {
        if (sub.pending) {
          sub.pending = false
          for (const relay of connectedRelays) {
            sub.sub.add(relay.subscribe(sub.filters, subId, sub.closeAfter))
          }
        } else {
          sub.sub.add(relay.subscribe(sub.filters, subId, sub.closeAfter))
        }
      }
    }

    this.emit('open', relay)
  }
}

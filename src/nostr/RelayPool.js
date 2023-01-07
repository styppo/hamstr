import {Relay} from 'src/nostr/Relay'
import {Observable} from 'src/nostr/utils'

export default class extends Observable {
  constructor(urls) {
    super()

    this.relays = {}
    this.subs = {}

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

  send(event) {
    for (const relay of this.connectedRelays()) {
      relay.send(event)
    }
  }

  subscribe(subId, filters) {
    // console.log(`Subscribing ${subId}`, filters)
    this.subs[subId] = filters
    for (const relay of this.connectedRelays()) {
      relay.subscribe(subId, filters)
    }
  }

  unsubscribe(subId) {
    delete this.subs[subId]
    for (const relay of this.connectedRelays()) {
      relay.unsubscribe(subId)
    }
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

  onOpen(relay) {
    console.log(`Connected to ${relay}`, relay)
    for (const subId of Object.keys(this.subs)) {
      console.log(`Subscribing ${subId} with ${relay}`, this.subs[subId])
      relay.subscribe(subId, this.subs[subId])
    }
    this.emit('open', relay)
  }
}

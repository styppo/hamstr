import {Observable} from 'src/nostr/Observable'
import Event from 'src/nostr/model/Event'

export class Subscription extends Observable {
  constructor(relay, subId, closeAfter) {
    super()
    this.relay = relay
    this.subId = subId
    this.closeAfter = closeAfter
    this.closed = false
  }

  close() {
    if (this.closed) return
    this.closed = true
    this.relay.unsubscribe(this.subId)
    this.emit('close', this.relay, this.subId)
  }

  onEvent(ev) {
    const event = Event.from(ev)
    if (!event.validate()) {
      // TODO Close relay?
      console.error(`Invalid event from ${this.relay}`, event)
      return
    }

    this.emit('event', event, this.relay, this.subId)

    if (this.closeAfter === CloseAfter.SINGLE) {
      this.close()
    }
  }

  onEose() {
    this.emit('eose', this.relay, this.subId)

    if (this.closeAfter === CloseAfter.EOSE) {
      this.close()
    }
  }
}

export const CloseAfter = {
  SINGLE: 'single',
  EOSE: 'eose',
  NEVER: 'never',
}

export class Relay extends Observable {
  constructor(url, opts) {
    super()
    this.url = url

    this.socket = new ReconnectingWebSocket(url, opts)
    this.socket.on('open', this.emit.bind(this, 'open', this))
    this.socket.on('close', this.emit.bind(this, 'close', this))
    this.socket.on('error', this.emit.bind(this, 'error', this))
    this.socket.on('message', this.onMessage.bind(this))

    this.subs = {}
    this.nextSubId = 0
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  isConnected() {
    return this.socket.isConnected()
  }

  publish(event) {
    return new Promise(resolve => {
      if (!this.socket.send(['EVENT', event])) {
        return resolve(false)
      }

      let timeout
      const callback = (eventId, wasSaved) => {
        if (eventId === event.id && wasSaved) {
          clearTimeout(timeout)
          this.off('ok', callback)
          resolve(true)
        }
      }
      timeout = setTimeout(() => {
        this.off('ok', callback)
        resolve(false)
      }, 4000) // TODO make this a parameter

      this.on('ok', callback)
    })
  }

  subscribe(filters, subId = null, closeAfter = CloseAfter.NEVER) {
    if (!subId) subId = `sub${this.nextSubId++}`
    const sub = new Subscription(this, subId, closeAfter)
    this.subs[subId] = sub
    this.socket.send(['REQ', subId, filters])
    return sub
  }

  unsubscribe(subId) {
    if (!this.subs[subId]) return
    delete this.subs[subId]
    this.socket.send(['CLOSE', subId])
  }

  onMessage(event) {
    try {
      this.processMessage(event.data)
    } catch (e) {
      // TODO Remove this relay?
      console.error(`Invalid message from ${this.url}: ${e.message || e}`, event.data, e)
    }
  }

  processMessage(msg) {
    const array = JSON.parse(msg)

    if (!Array.isArray(array) || !array.length) {
      throw new Error('not a nostr message')
    }

    const type = array[0]
    switch (type) {
      case 'EVENT': {
        Relay.enforceArrayLength(array, 3)
        const [_, subId, event] = array

        const sub = this.subs[subId]
        if (sub) sub.onEvent(event)

        // still needed?
        this.emit('event', subId, event)
        break
      }
      case 'EOSE': {
        Relay.enforceArrayLength(array, 2)
        const [_, subId] = array

        const sub = this.subs[subId]
        if (sub) sub.onEose()

        // still needed?
        this.emit('eose', subId)
        break
      }
      case 'NOTICE': {
        Relay.enforceArrayLength(array, 2)
        const [_, payload] = array
        this.emit('notice', payload)
        break
      }
      case 'OK': {
        Relay.enforceArrayLength(array, 4)
        const [_, eventId, wasSaved, message] = array
        this.emit('ok', eventId, wasSaved, message)
        break
      }
      default:
        throw new Error(`unknown message type '${type}'`)
    }
  }

  static enforceArrayLength(array, length) {
    if (array.length !== length) {
      throw new Error(`unexpected length (expected ${length}, got ${array.length})`)
    }
    if (array.some(elem => elem === undefined)) {
      throw new Error(`required element missing (${length} needed)`)
    }
  }

  toString() {
    return this.url
  }
}

class ReconnectingWebSocket extends Observable {
  constructor(url, opts) {
    super()
    this.url = url
    this.opts = Object.assign({
      reconnect: true,
      reconnectAfter: 3000,
    }, opts)

    this.socket = null
    this.disconnected = false
    this.reconnectAfter = this.opts.reconnectAfter
    this.reconnectTimer = null

    window.addEventListener('online', this.connect.bind(this))
    window.addEventListener('focus', this.connect.bind(this))
  }

  connect() {
    if (this.isConnected()) return
    this.disconnected = false
    this.reconnectTimer = null

    const ws = new WebSocket(this.url)
    ws.onopen = this.onOpen.bind(this)
    ws.onclose = this.onClose.bind(this)
    ws.onerror = this.onError.bind(this)
    ws.onmessage = this.onMessage.bind(this)
    this.socket = ws
  }

  disconnect() {
    this.disconnected = true
    this.close()
  }

  reconnect() {
    if (this.disconnected || this.reconnectTimer) return

    console.log(`[RELAY] Scheduling reconnect to ${this.url} in ${this.reconnectAfter}ms`)
    this.reconnectTimer = setTimeout(
      () => {
        console.log(`[RELAY] Reconnecting to ${this.url} now`)
        this.reconnectTimer = null
        this.connect()
      },
      this.reconnectAfter
    )

    this.reconnectAfter = Math.min(this.reconnectAfter *= 2, 1000 * 60 * 5)
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  close() {
    if (this.socket) this.socket.close()
    this.socket = null
  }

  send(message) {
    // TODO Wait for connected?
    if (!this.isConnected()) {
      console.warn(`Not connected to ${this.url} (currently ${this.socket?.readyState})`)
      return false
    }

    try {
      this.socket.send(JSON.stringify(message))
      return true
    } catch (e) {
      return false
    }
  }

  onOpen() {
    this.emit('open', this)
    this.reconnectAfter = this.opts.reconnectAfter
  }

  onClose() {
    this.close()
    this.emit('close', this)
    if (this.opts.reconnect) this.reconnect()
  }

  onError(error) {
    console.log(`Socket error from relay ${this.url}`, error)
    this.emit('error', error, this)

    if (!this.isConnected()) {
      this.close()
      if (this.opts.reconnect) this.reconnect()
    }
  }

  onMessage(message) {
    this.emit('message', message, this)
  }
}

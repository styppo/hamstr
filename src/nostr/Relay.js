import {Observable} from 'src/nostr/utils'

export class Relay extends Observable {
  constructor(url, opts) {
    super()
    this.url = url

    this.socket = new ReconnectingWebSocket(url, opts)
    this.socket.on('open', this.emit.bind(this, 'open', this))
    this.socket.on('close', this.emit.bind(this, 'close', this))
    this.socket.on('error', this.emit.bind(this, 'error', this))
    this.socket.on('message', this.onMessage.bind(this))
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

  send(event) {
    this.socket.send(['EVENT', event])
  }

  subscribe(subId, filters) {
    console.log(`${this} subscribing to ${subId}`, filters)
    this.socket.send(['REQ', subId, filters])
  }

  unsubscribe(subId) {
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

    if (!Array.isArray(array) || array.length === 0) {
      throw new Error('not a nostr message')
    }

    const type = array[0]
    switch (type) {
      case 'EVENT': {
        Relay.enforceArrayLength(array, 3)
        const [_, subId, event] = array
        this.emit('event', subId, event)
        break
      }
      case 'EOSE': {
        Relay.enforceArrayLength(array, 2)
        const [_, subId] = array
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
  }

  connect() {
    if (this.socket) return
    this.disconnected = false

    const ws = new WebSocket(this.url)
    ws.onopen = this.onOpen.bind(this)
    ws.onclose = this.onClose.bind(this)
    ws.onerror = this.onError.bind(this)
    ws.onmessage = this.onMessage.bind(this)
    this.socket = ws
  }

  disconnect() {
    this.disconnected = true
    if (this.socket) this.socket.close()
    this.socket = null
  }

  reconnect() {
    if (this.disconnected || this.reconnectTimer) return

    this.reconnectTimer = setTimeout(
      () => {
        this.connect()
        this.reconnectTimer = null
      },
      this.reconnectAfter
    )

    this.reconnectAfter *= 2
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  send(message) {
    // TODO Wait for connected?
    if (!this.isConnected()) {
      console.warn(`Not connected to ${this.url} (currently ${this.socket?.readyState})`)
      return
    }

    this.socket.send(JSON.stringify(message))
  }

  onOpen() {
    this.emit('open', this)
    this.reconnectAfter = this.opts.reconnectAfter
  }

  onClose() {
    this.emit('close', this)
    if (this.opts.reconnect) this.reconnect()
  }

  onError(error) {
    console.log(`Socket error from relay ${this.url}`, error)

    this.emit('error', error, this)
    if (this.opts.reconnect) this.reconnect()
  }

  onMessage(message) {
    this.emit('message', message, this)
  }
}

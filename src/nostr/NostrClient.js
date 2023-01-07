import RelayPool from 'src/nostr/RelayPool'
import Event from 'src/nostr/model/Event'

export const CancelAfter = {
  SINGLE: 'single',
  EOSE: 'eose',
  NEVER: 'never',
}

export default class NostrClient {
  constructor(relays) {
    this.pool = new RelayPool(relays)
    this.pool.on('event', this.onEvent.bind(this))
    this.pool.on('eose', this.onEose.bind(this))
    this.pool.on('notice', this.onNotice.bind(this))
    this.pool.on('ok', this.onOk.bind(this))

    this.subs = {}
    this.nextSubId = 0
  }

  connect() {
    this.pool.connect()
  }

  disconnect() {
    this.pool.disconnect()
  }

  subscribe(filters, callback, opts) {
    let subId
    if (opts?.subId) {
      //if (this.subs[opts.subId]) throw new Error(`SubId '${opts.subId}' already exists`)
      subId = opts.subId
    } else {
      subId = `sub${this.nextSubId++}`
    }

    this.subs[subId] = {
      eventCallback: callback,
      eoseCallback: opts.eoseCallback,
      cancelAfter: opts.cancelAfter || CancelAfter.NEVER,
    }
    this.pool.subscribe(subId, filters)

    return subId
  }

  unsubscribe(subId) {
    this.pool.unsubscribe(subId)
    delete this.subs[subId]
  }

  send(event) {
    return this.pool.send(event)
  }

  onEvent(relay, subId, ev) {
    const event = Event.from(ev)
    if (!event.validate()) {
      // TODO Close relay?
      console.error(`Invalid event from ${relay}`, event)
      return
    }

    const sub = this.subs[subId]
    if (!sub) {
      console.warn(`Event for invalid subId ${subId} from ${relay}`)
      return
    }

    if (typeof sub.eventCallback === 'function') {
      sub.eventCallback(event, relay, subId)
    }

    if (sub.cancelAfter === CancelAfter.SINGLE) {
      this.unsubscribe(subId)
    }
  }

  onEose(relay, subId) {
    console.log(`[EOSE] from ${relay} for ${subId}`)

    const sub = this.subs[subId]
    if (!sub) return

    if (typeof sub.eoseCallback === 'function') {
      sub.eoseCallback(relay, subId)
    }

    if (sub.cancelAfter === CancelAfter.EOSE) {
      this.unsubscribe(subId)
    }
  }

  onNotice(relay, message) {
    console.warn(`[NOTICE] from ${relay}: ${message}`)
  }

  onOk(relay, eventId, wasSaved, message) {
    console.log(`[OK] from ${relay}: eventId=${eventId}, wasSaved=${wasSaved}, message=${message}`)
  }
}

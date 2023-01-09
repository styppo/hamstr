import {getEventHash} from 'nostr-tools'

export const EventKind = {
  METADATA: 0,
  NOTE: 1,
  RELAY: 2,
  CONTACT: 3,
  DM: 4,
  DELETE: 5,
  SHARE: 6,
  REACTION: 7,
  CHATROOM: 42,
}

export const Tag = {
  PUBKEY: 'p',
  EVENT: 'e',
}

class EventRefs extends Array {
  constructor(refs) {
    // FIXME limit number of refs here
    super(...refs)
  }

  root() {
    return this[0]
  }

  ancestor() {
    return this[this.length - 1]
  }

  isEmpty() {
    return this.length === 0
  }
}

export default class Event {
  constructor(opts) {
    this.id = opts.id
    this.pubkey = opts.pubkey
    this.created_at = opts.createdAt || opts.created_at
    this.kind = opts.kind
    this.tags = opts.tags || []
    this.content = opts.content
    this.sig = opts.sig
  }

  static from(obj) {
    return new Event(obj)
  }

  static fresh(opts) {
    opts.createdAt = opts.createdAt || Math.floor(Date.now() / 1000)
    return new Event(opts)
  }

  get createdAt() {
    return this.created_at
  }

  validate() {
    // TODO
    return true
  }

  hash() {
    return getEventHash(this)
  }

  pubkeyRefs() {
    return this.tags
      .filter(tag => tag[0] === Tag.PUBKEY && tag[1])
      .map(tag => tag[1])
  }

  eventRefs() {
    const refs = this.tags
      .filter(tag => tag[0] === Tag.EVENT && tag[1])
      .map(tag => tag[1])
    return new EventRefs(refs)
  }
}

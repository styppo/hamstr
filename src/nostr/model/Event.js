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

export const TagType = {
  PUBKEY: 'p',
  EVENT: 'e',
}

export class Tag {
  constructor(type, ref, relay = null, meta = null) {
    this.type = type
    this.ref = ref
    this.relay = relay
    this.meta = meta
  }

  static from(array) {
    if (!array || !array[0] || !array[1]) return
    return new Tag(
      array[0],
      array[1],
      array[2] || null,
      array[3] || null,
    )
  }
}

export class EventRefs extends Array {
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

  static parseTags(tags) {
    const res = []
    for (const tag of tags) {
      const parsed = Tag.from(tag)
      if (!parsed) continue
      res.push(parsed)
    }
    return res
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

  pubkeyTags() {
    return Event.parseTags(this.tags).filter(tag => tag.type === TagType.PUBKEY)
  }

  eventTags() {
    return Event.parseTags(this.tags).filter(tag => tag.type === TagType.EVENT)
  }

  pubkeyRefs() {
    return this.pubkeyTags().map(tag => tag.ref)
  }

  eventRefs() {
    return new EventRefs(this.eventTags().map(tag => tag.ref))
  }
}

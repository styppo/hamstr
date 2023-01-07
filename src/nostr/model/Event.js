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
  constructor(args) {
    this.id = args.id
    this.pubkey = args.pubkey
    this.createdAt = args.createdAt || args.created_at
    this.kind = args.kind
    this.tags = args.tags || []
    this.content = args.content
    this.sig = args.sig
  }

  static from(obj) {
    return new Event(obj)
  }

  validate() {
    // TODO
    return true
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

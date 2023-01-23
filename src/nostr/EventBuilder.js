import Event, {EventKind, TagType} from 'src/nostr/model/Event'
import DateUtils from 'src/utils/DateUtils'

export default class EventBuilder {
  constructor(opts) {
    this.event = new Event({
      id: opts.id,
      pubkey: opts.pubkey || opts.author,
      created_at: opts.created_at || opts.createdAt || DateUtils.now(),
      kind: opts.kind,
      tags: opts.tags || [],
      content: opts.content || '',
      sig: opts.sig,
    })
  }

  static post(author, content) {
    return new EventBuilder({
      kind: EventKind.NOTE,
      pubkey: author,
      content
    })
  }

  static reply(ancestor, author, content) {
    const tags = []

    // Reference thread root and ancestor
    const root = ancestor.eventRefs().root()
    if (root) tags.push([TagType.EVENT, root]) // TODO relay, meta
    tags.push([TagType.EVENT, ancestor.id]) // TODO relay, meta

    // Tag author of ancestor
    tags.push([TagType.PUBKEY, ancestor.author])

    return new EventBuilder({
      kind: EventKind.NOTE,
      pubkey: author,
      content,
      tags,
    })
  }

  static reaction(ancestor, author) {
    const tags = []

    // Reference ancestor
    tags.push([TagType.EVENT, ancestor.id]) // TODO relay, meta

    // Tag author of ancestor
    tags.push([TagType.PUBKEY, ancestor.author])

    return new EventBuilder({
      kind: EventKind.REACTION,
      pubkey: author,
      content: '❤️', // TODO default reaction
      tags,
    })
  }

  static metadata(author, metadata) {
    return new EventBuilder({
      kind: EventKind.METADATA,
      pubkey: author,
      content: JSON.stringify(metadata),
    })
  }

  static contacts(author, pubkeys) {
    const tags = pubkeys.map(pubkey => [TagType.PUBKEY, pubkey])
    return new EventBuilder({
      kind: EventKind.CONTACT,
      pubkey: author,
      tags
    })
  }

  static delete(author, ids) {
    const tags = ids.map(id => [TagType.EVENT, id])
    return new EventBuilder({
      kind: EventKind.DELETE,
      pubkey: author,
      tags
    })
  }

  static message(author, recipient, ciphertext) {
    const tags = [[TagType.PUBKEY, recipient]]
    return new EventBuilder({
      kind: EventKind.DM,
      pubkey: author,
      content: ciphertext,
      tags,
    })
  }

  createdAt(timestamp) {
    this.event.created_at = timestamp
    return this
  }

  pubkeyTag(pubkey) {
    this.event.tags.push([TagType.PUBKEY, pubkey])
    return this
  }

  eventTag(id, relay = null, meta = null) {
    const tag = [TagType.EVENT, id]
    if (relay) tag.push(relay)
    if (meta) tag.push(meta)
    this.event.tags.push(tag)
    return this
  }

  content(content) {
    this.event.content = content
    return this
  }

  build() {
    return new Event(this.event)
  }
}

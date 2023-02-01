import Event, {EventKind, EventRefs, TagType} from 'src/nostr/model/Event'
import {isEmoji} from 'src/utils/utils'

export default class Note {
  constructor(id, args) {
    this.id = id
    this.kind = args.kind || EventKind.NOTE
    this.author = args.author || args.pubkey
    this.createdAt = args.createdAt
    this.content = args.content || ''
    this.tags = args.tags || []
  }

  static from(event) {
    const content = Note.isReaction(event)
      ? Note.normalizeReactionContent(event.content)
      : event.content

    return new Note(event.id, {
      kind: event.kind,
      author: event.pubkey,
      createdAt: event.createdAt,
      content,
      tags: Event.parseTags(event.tags),
    })
  }

  hasAncestor() {
    return this.eventTags().some(tag => tag.marker !== 'mention')
  }

  canReply() {
    return this.kind === EventKind.NOTE
  }

  root() {
    return this.eventRefs().root()
  }

  ancestor() {
    return this.eventRefs().ancestor()
  }

  pubkeyTags() {
    return this.tags.filter(tag => tag.type === TagType.PUBKEY)
  }

  eventTags() {
    return this.tags.filter(tag => tag.type === TagType.EVENT)
  }

  pubkeyRefs() {
    return this.pubkeyTags().map(tag => tag.ref)
  }

  eventRefs() {
    return new EventRefs(this.eventTags())
  }

  relatedPubkeys() {
    return [this.author].concat(this.pubkeyRefs())
  }

  contentTagRefs() {
    const regex = /#\[([0-9]+)]/g
    let refs = []
    let match
    while ((match = regex.exec(this.content))) {
      refs.push(match[1])
    }
    return refs
  }

  isRepostOrTag() {
    return Note.isRepostOrTag(this)
  }

  static isRepostOrTag(event) {
    return /#\[([0-9]+)]/.test(event.content)
  }

  isReaction() {
    return Note.isReaction(this)
  }

  static isReaction(event) {
    return event.kind === EventKind.REACTION
      || (!event.eventRefs().isEmpty() && Note.isReactionContent(event.content))
  }

  static isReactionContent(content) {
    return content === '+'
      || content === ''
      || isEmoji(content)
  }

  static normalizeReactionContent(content) {
    return isEmoji(content)
      ? content
      : '❤️'
  }
}

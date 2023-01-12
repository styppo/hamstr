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
    return !this.eventRefs().isEmpty()
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

  pubkeyRefs() {
    return this.tags
      .filter(tag => tag.type === TagType.PUBKEY)
      .map(tag => tag.ref)
  }

  eventRefs() {
    const refs = this.tags
      .filter(tag => tag.type === TagType.EVENT)
      .map(tag => tag.ref)
    return new EventRefs(refs)
  }

  contentTagRefs() {
    const regex = /#\[([0-9]+)]/ig
    let refs = []
    let match
    while ((match = regex.exec(this.content))) {
      refs.push(match[1])
    }
    return refs
  }

  isReaction() {
    return this.kind === EventKind.REACTION
      || (this.hasAncestor() && Note.isReactionContent(this.content))
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

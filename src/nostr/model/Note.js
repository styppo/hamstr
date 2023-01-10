import {EventKind} from 'src/nostr/model/Event'
import {isEmoji} from 'src/utils/utils'

export default class Note {
  constructor(id, args) {
    this.id = id
    this.kind = args.kind || EventKind.NOTE
    this.author = args.author || args.pubkey
    this.createdAt = args.createdAt
    this.content = args.content
    this.refs = {
      events: args.refs?.events || [],
      pubkeys: args.refs?.pubkeys || [],
    }
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
      refs: {
        events: event.eventRefs(),
        pubkeys: event.pubkeyRefs(),
      }
    })
  }

  isReply() {
    return !this.refs.events.isEmpty()
  }

  canReply() {
    return this.kind === EventKind.NOTE
  }

  root() {
    return this.refs.events.root()
  }

  ancestor() {
    return this.refs.events.ancestor()
  }

  isReaction() {
    return this.kind === EventKind.REACTION
      || (this.isReply() && Note.isReactionContent(this.content))
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

import {EventKind} from 'src/nostr/model/Event'

export default class Note {
  constructor(id, args) {
    this.id = id
    this.author = args.author || args.pubkey
    this.createdAt = args.createdAt
    this.content = args.content
    this.refs = {
      events: args.refs?.events || [],
      pubkeys: args.refs?.pubkeys || [],
    }
  }

  static from(event) {
    console.assert(event.kind === EventKind.NOTE)
    return new Note(event.id, {
      author: event.pubkey,
      createdAt: event.createdAt,
      content: event.content,
      refs: {
        events: event.eventRefs(),
        pubkeys: event.pubkeyRefs(),
      }
    })
  }

  isReply() {
    return !this.refs.events.isEmpty()
  }

  root() {
    return this.refs.events.root()
  }

  ancestor() {
    return this.refs.events.ancestor()
  }
}

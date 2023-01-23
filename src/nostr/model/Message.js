import {EventKind} from 'src/nostr/model/Event'

export default class Message {
  constructor(id, args) {
    this.id = id
    this.author = args.author || args.pubkey
    this.createdAt = args.createdAt
    this.content = args.content || ''
    this.tags = args.tags
    this.recipients = args.recipients
    this.ancestor = args.ancestor
    this.plaintext = args.plaintext
  }

  static from(event) {
    console.assert(event.kind === EventKind.DM)
    const recipients = event.pubkeyRefs()
    if (!recipients || !recipients.length) return

    const ancestor = event.eventRefs().ancestor()
    return new Message(event.id, {
      author: event.pubkey,
      createdAt: event.createdAt,
      content: event.content,
      tags: event.tags,
      recipients,
      ancestor,
    })
  }

  get recipient() {
    return this.recipients[0]
  }

  cachePlaintext(plaintext) {
    this.plaintext = plaintext
  }
}

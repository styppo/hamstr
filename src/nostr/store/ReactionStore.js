import {defineStore} from 'pinia'
import {NoteOrder} from 'src/nostr/store/NoteStore'
import Note from 'src/nostr/model/Note'

// class Reaction {
//   constructor(id, ancestor, author, createdAt, emoji) {
//     this.id = id
//     this.ancestor = ancestor
//     this.author = author
//     this.createdAt = createdAt
//     this.emoji = emoji
//   }
//
//   static from(event) {
//     console.assert([EventKind.REACTION, EventKind.NOTE].includes(event.kind))
//     if (event.eventRefs().isEmpty()) return
//
//     // TODO Normalize content better
//     const emoji = isEmoji(event.content)
//       ? event.content
//       : '❤️'
//
//     return new Reaction(
//       event.id,
//       event.eventRefs().ancestor(),
//       event.pubkey,
//       event.createdAt,
//       emoji
//     )
//   }
// }

export const ReactionOrder = NoteOrder

export const useReactionStore = defineStore('reaction', {
  state: () => ({
    reactions: {},
    byEvent: {},
    byAuthor: {},
  }),
  getters: {
    get(state) {
      return id => state.reactions[id]
    },
    allByEvent(state) {
      return (id, order) => (state.byEvent[id] || []).sort(order || ReactionOrder.CREATION_DATE_DESC)
    },
    allByAuthor(state) {
      return (pubkey, order) => (state.byAuthor[pubkey] || []).sort(order || ReactionOrder.CREATION_DATE_DESC)
    }
  },
  actions: {
    addEvent(event) {
      const note = Note.from(event)
      if (!note || !note.isReply()) return false

      // Skip if reaction already exists
      if (this.reactions[note.id]) return this.reactions[note.id]

      this.reactions[note.id] = note

      if (!this.byEvent[note.ancestor()]) {
        this.byEvent[note.ancestor()] = []
      }
      this.byEvent[note.ancestor()].push(note)

      if (!this.byAuthor[note.author]) {
        this.byAuthor[note.author] = []
      }
      this.byAuthor[note.author].push(note)

      return this.reactions[note.id]
    }
  }
})

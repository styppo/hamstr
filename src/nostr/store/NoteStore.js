import {defineStore} from 'pinia'
import Note from 'src/nostr/model/Note'

export const NoteOrder = {
  CREATION_DATE_ASC: (a, b) => a.createdAt - b.createdAt,
  CREATION_DATE_DESC: (a, b) => b.createdAt - a.createdAt,
}

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: {},
    replies: {},
    byAuthor: {},
  }),
  getters: {
    get(state) {
      return id => state.notes[id]
    },
    repliesTo(state) {
      return (id, order) => (state.replies[id] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    },
    allByAuthor(state) {
      return (pubkey, order) => (state.byAuthor[pubkey] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    }
  },
  actions: {
    addEvent(event) {
      const note = Note.from(event)
      if (!note) return false

      // Skip if note already exists
      if (this.notes[note.id]) return this.notes[note.id]

      this.notes[note.id] = note

      if (!this.byAuthor[note.author]) {
        this.byAuthor[note.author] = []
      }
      this.byAuthor[note.author].push(note)

      if (note.isReply()) {
        if (!this.replies[note.ancestor()]) {
          this.replies[note.ancestor()] = []
        }
        this.replies[note.ancestor()].push(note)
      }

      return this.notes[note.id]
    }
  }
})

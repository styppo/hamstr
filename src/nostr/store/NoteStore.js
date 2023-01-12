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
    reactions: {},
    notesByAuthor: {},
    reactionsByAuthor: {},
  }),
  getters: {
    get(state) {
      return id => state.notes[id]
    },
    repliesTo(state) {
      return (id, order) => (state.replies[id] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    },
    reactionsTo(state) {
      return (id, order) => (state.reactions[id] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    },
    getNotesByAuthor(state) {
      return (pubkey, order) => (state.notesByAuthor[pubkey] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    },
    getReactionsByAuthor(state) {
      return (pubkey, order) => (state.reactionsByAuthor[pubkey] || []).sort(order || NoteOrder.CREATION_DATE_ASC)
    },
  },
  actions: {
    addEvent(event) {
      const note = Note.from(event)
      if (!note) return false

      // Skip if note already exists
      if (this.notes[note.id]) return this.notes[note.id]
      this.notes[note.id] = note

      const byAuthor = note.isReaction()
        ? this.reactionsByAuthor
        : this.notesByAuthor
      if (!byAuthor[note.author]) {
        byAuthor[note.author] = []
      }
      byAuthor[note.author].push(note)

      if (note.hasAncestor()) {
        const map = note.isReaction()
          ? this.reactions
          : this.replies
        if (!map[note.ancestor()]) {
          map[note.ancestor()] = []
        }
        map[note.ancestor()].push(note)
      }

      return this.notes[note.id]
    }
  }
})

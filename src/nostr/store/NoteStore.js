import {defineStore} from 'pinia'
import Note from 'src/nostr/model/Note'

export const NoteOrder = {
  CREATION_DATE_ASC: (a, b) => a.createdAt - b.createdAt,
  CREATION_DATE_DESC: (a, b) => b.createdAt - a.createdAt,
}

class NoteIndex {
  constructor() {
    this.byAuthor = {}
    this.byAncestor = {}
    this.byTag = {}
  }

  add(note) {
    NoteIndex.addToIndex(this.byAuthor, note.author, note)

    if (note.hasAncestor()) {
      NoteIndex.addToIndex(this.byAncestor, note.ancestor(), note)
    }

    for (const pubkey of note.pubkeyRefs()) {
      NoteIndex.addToIndex(this.byTag, pubkey, note)
    }
  }

  remove(note) {
    NoteIndex.removeFromIndex(this.byAuthor, note.author, note.id)
    NoteIndex.removeFromIndex(this.byAncestor, note.ancestor(), note.id)
    for (const pubkey of note.pubkeyRefs()) {
      NoteIndex.removeFromIndex(this.byTag, pubkey, note.id)
    }
  }

  static addToIndex(index, key, note) {
    if (!index[key]) {
      index[key] = []
    }
    index[key].push(note)
  }

  static removeFromIndex(index, key, noteId) {
    const values = index[key]
    if (!values) return
    const idx = values.findIndex(note => note.id === noteId)
    if (idx < 0) return
    values.splice(idx, 1)
    if (!values.length) delete index[key]
  }

  getByAuthor(pubkey) {
    return this.byAuthor[pubkey]
  }

  getByAncestor(id) {
    return this.byAncestor[id]
  }

  getByTag(pubkey) {
    return this.byTag[pubkey]
  }
}

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: {},
    postIndex: new NoteIndex(),
    reactionIndex: new NoteIndex(),
  }),
  getters: {
    get(state) {
      return id => state.notes[id]
    },
    notesByAuthor(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.postIndex.getByAuthor(pubkey) || [])
        .concat((state.reactionIndex.getByAuthor(pubkey) || []))
        .sort(order)
    },
    notesByTag(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.postIndex.getByTag(pubkey) || [])
        .concat(state.reactionIndex.getByTag(pubkey))
        .sort(order)
    },
    repliesTo(state) {
      return (id, order = NoteOrder.CREATION_DATE_ASC) => (state.postIndex.getByAncestor(id) || []).sort(order)
    },
    postsByAuthor(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.postIndex.getByAuthor(pubkey) || []).sort(order)
    },
    postsByTag(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.postIndex.getByTag(pubkey) || []).sort(order)
    },
    reactionsTo(state) {
      return (id, order = NoteOrder.CREATION_DATE_ASC) => (state.reactionIndex.getByAncestor(id) || []).sort(order)
    },
    reactionsByAuthor(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.reactionIndex.getByAuthor(pubkey) || []).sort(order)
    },
    reactionsByTag(state) {
      return (pubkey, order = NoteOrder.CREATION_DATE_ASC) => (state.reactionIndex.getByTag(pubkey) || []).sort(order)
    },
  },
  actions: {
    addEvent(event) {
      const note = Note.from(event)
      if (!note) return false

      // Skip if note already exists
      if (this.notes[note.id]) {
        return this.notes[note.id]
      }
      this.notes[note.id] = note

      if (note.isReaction()) {
        this.reactionIndex.add(note)
      } else {
        this.postIndex.add(note)
      }

      return this.notes[note.id]
    },
    deleteEvent(event) {
      for (const id of event.eventRefs()) {
        this.deleteNote(id, event.pubkey)
      }
    },
    deleteNote(id, owner) {
      const note = this.get(id)
      if (!note) return
      if (note.author !== owner) return

      if (note.isReaction()) {
        this.reactionIndex.remove(note)
      } else {
        this.postIndex.remove(note)
      }
      delete this.notes[id]
    }
  }
})

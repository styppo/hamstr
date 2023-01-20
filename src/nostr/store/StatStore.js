import {defineStore} from 'pinia'
import {EventKind} from 'src/nostr/model/Event'
import Note from 'src/nostr/model/Note'
import {useNoteStore} from 'src/nostr/store/NoteStore'

export const useStatStore = defineStore('stat', {
  state: () => ({
    stats: {},
  }),
  getters: {
    get(state) {
      return id => state.stats[id] || {
        comments: 0,
        reactions: 0,
        shares: 0,
      }
    },
  },
  actions: {
    addEvent(event) {
      switch (event.kind) {
        case EventKind.NOTE: {
          if (Note.isReaction(event)) {
            const stats = this.getOrInit(event.eventRefs().ancestor())
            stats.reactions++
          } else if (Note.isRepostOrTag(event)) {
            const stats = this.getOrInit(event.eventRefs().ancestor())
            stats.shares++
          } else {
            for (const eventId of event.eventRefs()) {
              const stats = this.getOrInit(eventId)
              stats.comments++
            }
          }
          break
        }
        case EventKind.REACTION: {
          const refs = event.eventRefs()
          if (refs.isEmpty()) break
          const stats = this.getOrInit(refs.ancestor())
          stats.reactions++
          break
        }
        case EventKind.SHARE: {
          const refs = event.eventRefs()
          if (refs.isEmpty()) break
          const stats = this.getOrInit(refs.ancestor())
          stats.shares++
          break
        }
        case EventKind.DELETE:
          this.deleteEvent(event)
          break
      }
    },
    deleteEvent(event) {
      // FIXME Shares are not correctly decremented yet as they are not yet stored in the note store
      for (const id of event.eventRefs()) {
        this.deleteNote(id, event.pubkey)
      }
    },
    deleteNote(id, owner) {
      const notes = useNoteStore()
      const note = notes.get(id)
      if (!note) return
      if (note.author !== owner) return

      if (note.isReaction()) {
        const stats = this.getOrInit(note.ancestor())
        stats.reactions--
      } else if (note.isRepostOrTag()) {
        const stats = this.getOrInit(note.ancestor())
        stats.shares--
      } else {
        for (const eventId of note.eventRefs()) {
          const stats = this.getOrInit(eventId)
          stats.comments--
        }
      }
    },
    getOrInit(id) {
      if (!this.stats[id]) {
        this.stats[id] = {
          comments: 0,
          reactions: 0,
          shares: 0,
        }
      }
      return this.stats[id]
    }
  }
})

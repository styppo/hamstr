import {defineStore} from 'pinia'
import {EventKind} from 'src/nostr/model/Event'
import Note from 'src/nostr/model/Note'

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

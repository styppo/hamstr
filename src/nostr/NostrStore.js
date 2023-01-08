import {defineStore} from 'pinia'
import {EventKind} from 'src/nostr/model/Event'
import NostrClient from 'src/nostr/NostrClient'
import {NoteOrder, useNoteStore} from 'src/nostr/store/NoteStore'
import {useProfileStore} from 'src/nostr/store/ProfileStore'
import {markRaw} from 'vue'
import FetchQueue from 'src/nostr/FetchQueue'

// TODO Move to settings
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr-relay.wlvs.space',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.oxtr.dev',
]

export const Feeds = {
  GLOBAL: {
    name: 'global',
    filters: {
      kinds: [EventKind.NOTE, EventKind.DELETE],
    },
    initialFetchSize: 100,
  },
}

const eventQueue = (client, subId) => new FetchQueue(
  client,
  subId,
  event => event.id,
  ids => ({
    ids: ids
  })
)

const profileQueue = client => new FetchQueue(
  client,
  'profile',
  event => event.pubkey,
  pubkeys => ({
    kinds: [EventKind.METADATA],
    authors: pubkeys
  })
)

export const useNostrStore = defineStore('nostr', {
  state: () => ({
    // TODO Limit size. Remove oldest.
    seenBy: {}, // EventId -> {RelayURL -> Timestamp, ...}
  }),
  actions: {
    init() {
      this.client = markRaw(new NostrClient(RELAYS))
      this.client.connect()

      this.profileQueue = profileQueue(this.client)
      this.profileQueue.on('event', this.addEvent.bind(this))

      this.noteQueue = eventQueue(this.client, 'note')
      this.noteQueue.on('event', this.addEvent.bind(this))
    },
    addEvent(event, relay) {
      // console.log(`[EVENT] from ${relay}`, event)

      if (this.seenBy[event.id]) {
        this.seenBy[event.id][relay.url] = Date.now()
      } else {
        this.seenBy[event.id] = {
          [relay.url]: Date.now()
        }
      }

      switch (event.kind) {
        case EventKind.METADATA: {
          const profiles = useProfileStore()
          return profiles.addEvent(event)
        }
        case EventKind.NOTE: {
          const notes = useNoteStore()
          return notes.addEvent(event)
        }
        case EventKind.RELAY:
          break
        case EventKind.CONTACT:
          break
        case EventKind.DM:
          break
        case EventKind.DELETE:
          break
        case EventKind.SHARE:
          break
        case EventKind.REACTION:
          break
        case EventKind.CHATROOM:
          break
      }
    },

    hasEvent(id) {
      return !!this.seenBy[id]
    },

    getProfile(pubkey) {
      const profiles = useProfileStore()
      const profile = profiles.get(pubkey)
      if (!profile) this.profileQueue.add(pubkey)
      return profile
    },

    getNote(id) {
      const notes = useNoteStore()
      const note = notes.get(id)
      if (!note) this.noteQueue.add(id)
      return note
    },

    getRepliesTo(id, order = NoteOrder.CREATION_DATE_DESC) {
      const notes = useNoteStore()
      const replies = notes.repliesTo(id, order)
      // TODO fetch
      return replies
    },

    getNotesByAuthor(pubkey, opts = {}) {
      const order = opts.order || NoteOrder.CREATION_DATE_DESC
      const notes = useNoteStore()
      return notes.allByAuthor(pubkey, order)
    },

    fetchNotesByAuthor(pubkey, opts = {}) {
      const limit = opts.limit || 100
      return this.fetchMultiple(
        {
          kinds: [EventKind.NOTE],
          authors: [pubkey],
        },
        limit
      )
    },

    streamThread(rootId, eventCallback, initialFetchCompleteCallback) {
      return this.streamEvents(
        {
          kinds: [EventKind.NOTE],
          '#e': [rootId],
        },
        500,
        eventCallback,
        initialFetchCompleteCallback,
        {
          subId: `thread:${rootId}`,
        }
      )
    },

    streamFeed(feed, eventCallback, initialFetchCompleteCallback) {
      return this.streamEvents(
        feed.filters,
        feed.initialFetchSize,
        eventCallback,
        initialFetchCompleteCallback,
        {
          subId: feed.name,
        }
      )
    },

    cancelStream(subId) {
      this.client.unsubscribe(subId)
    },

    fetchEvent(id) {
      this.fetchSingle({
        ids: [id],
      })
    },

    fetchSingle(filters) {
      const filtersWithLimit = Object.assign({}, filters, {limit: 1})
      return new Promise(resolve => {
        this.client.subscribe(
          filtersWithLimit,
          (event, relay) => {
            resolve(this.addEvent(event, relay))
          },
          {
            cancelAfter: 'single'
          }
        )
      })
    },

    fetchMultiple(filters, limit = 100) {
      const filtersWithLimit = Object.assign({}, filters, {limit})
      return new Promise(resolve => {
        const objects = []
        this.client.subscribe(
          filtersWithLimit,
          (event, relay, subId) => {
            const obj = this.addEvent(event, relay)
            if (!obj) return
            // TODO Deduplicate
            objects.push(obj)
            if (objects.length >= limit) {
              this.client.unsubscribe(subId)
              resolve(objects)
            }
          },
          {
            eoseCallback: (_relay, subId) => {
              this.client.unsubscribe(subId)
              resolve(objects)
            }
          }
        )
      })
    },

    streamEvents(filters, initialFetchSize, eventCallback, initialFetchCompleteCallback, opts) {
      const filtersWithLimit = Object.assign({}, filters, {limit: initialFetchSize})

      let numEventsSeen = 0
      let initialFetchComplete = false

      return this.client.subscribe(
        filtersWithLimit,
        (event, relay) => {
          const obj = this.addEvent(event, relay)
          if (!obj) return

          if (eventCallback) eventCallback(obj, relay)

          if (++numEventsSeen >= initialFetchSize && !initialFetchComplete) {
            initialFetchComplete = true
            if (initialFetchCompleteCallback) initialFetchCompleteCallback()
          }
        },
        {
          subId: opts.subId || null,
          cancelAfter: 'never',
          eoseCallback: () => {
            if (!initialFetchComplete) {
              initialFetchComplete = true
              if (initialFetchCompleteCallback) initialFetchCompleteCallback()
            }
          }
        }
      )
    }
  },
})

import {defineStore} from 'pinia'
import {markRaw} from 'vue'
import {EventKind} from 'src/nostr/model/Event'
import NostrClient from 'src/nostr/NostrClient'
import FetchQueue from 'src/nostr/FetchQueue'
import {NoteOrder, useNoteStore} from 'src/nostr/store/NoteStore'
import {useProfileStore} from 'src/nostr/store/ProfileStore'
import {useContactStore} from 'src/nostr/store/ContactStore'
import {useSettingsStore} from 'stores/Settings'

export const Feeds = {
  GLOBAL: {
    name: 'global',
    filters: {
      kinds: [EventKind.NOTE], // TODO Deletions
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

const contactQueue = client => new FetchQueue(
  client,
  'contact',
  event => event.pubkey,
  pubkeys => ({
    kinds: [EventKind.CONTACT],
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
      const settings = useSettingsStore()
      console.log(settings.relays)
      this.client = markRaw(new NostrClient(settings.relays))
      this.client.connect()

      this.profileQueue = profileQueue(this.client)
      this.profileQueue.on('event', this.addEvent.bind(this))

      this.noteQueue = eventQueue(this.client, 'note')
      this.noteQueue.on('event', this.addEvent.bind(this))

      this.contactQueue = contactQueue(this.client, 'queue')
      this.contactQueue.on('event', this.addEvent.bind(this))
    },
    addEvent(event, relay = null) {
      // console.log(`[EVENT] from ${relay}`, event)

      if (relay?.url) {
        if (this.seenBy[event.id]) {
          this.seenBy[event.id][relay.url] = Date.now()
        } else {
          this.seenBy[event.id] = {
            [relay.url]: Date.now()
          }
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
        case EventKind.CONTACT: {
          const contacts = useContactStore()
          return contacts.addEvent(event)
        }
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

    sendEvent(event) {
      this.addEvent(event)
      return this.client.send(event)
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

    getContacts(pubkey) {
      const store = useContactStore()
      const contacts = store.getContacts(pubkey)
      if (!contacts) this.contactQueue.add(pubkey)
      return contacts
    },

    getFollowers(pubkey) {
      const store = useContactStore()
      const followers = store.getFollowers(pubkey)
      // TODO fetch
      return followers
    },

    fetchFollowers(pubkey, opts = {}) {
      const limit = opts.limit || 500
      return this.fetchMultiple(
        {
          kinds: [EventKind.CONTACT],
          '#p': [pubkey],
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
      let unsubscribeTimeout
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
              if (unsubscribeTimeout) clearTimeout(unsubscribeTimeout)
              unsubscribeTimeout = setTimeout(() => {
                this.client.unsubscribe(subId)
                resolve(objects)
              }, 250)
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
          const known = this.hasEvent(event.id)
          const obj = this.addEvent(event, relay)
          if (!obj || known) return

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

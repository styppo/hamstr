import {defineStore} from 'pinia'
import {markRaw} from 'vue'
import {EventKind} from 'src/nostr/model/Event'
import NostrClient from 'src/nostr/NostrClient'
import FetchQueue from 'src/nostr/FetchQueue'
import {NoteOrder, useNoteStore} from 'src/nostr/store/NoteStore'
import {useProfileStore} from 'src/nostr/store/ProfileStore'
import {useContactStore} from 'src/nostr/store/ContactStore'
import {useSettingsStore} from 'stores/Settings'
import {useStatStore} from 'src/nostr/store/StatStore'
import {CloseAfter} from 'src/nostr/Relay'

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

          const stats = useStatStore()
          stats.addEvent(event)
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
        case EventKind.REACTION: {
          const notes = useNoteStore()
          return notes.addEvent(event)
        }
        case EventKind.CHATROOM:
          break
      }
    },

    hasEvent(id) {
      return !!this.seenBy[id]
    },

    sendEvent(event) {
      this.addEvent(event)
      return this.client.publish(event)
    },

    getProfile(pubkey) {
      const profiles = useProfileStore()
      const profile = profiles.get(pubkey)
      if (!profile) this.profileQueue.add(pubkey)
      return profile
    },

    getNote(id) {
      const notes = useNoteStore()
      let note = notes.get(id)
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
      return notes.getNotesByAuthor(pubkey, order)
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

    getReactionsTo(id, order = NoteOrder.CREATION_DATE_DESC) {
      const store = useNoteStore()
      const reactions = store.reactionsTo(id, order)
      // TODO fetch?
      return reactions
    },

    fetchReactionsTo(id, limit = 500) {
      return this.fetchMultiple(
        {
          kinds: [EventKind.REACTION],
          '#e': [id],
        },
        limit
      )
    },

    getReactionsByAuthor(pubkey, order = NoteOrder.CREATION_DATE_DESC) {
      const store = useNoteStore()
      const reactions = store.getReactionsByAuthor(pubkey, order)
      // TODO fetch?
      return reactions
    },

    fetchReactionsByAuthor(pubkey, limit = 500) {
      return this.fetchMultiple(
        {
          kinds: [EventKind.REACTION],
          authors: [pubkey],
        },
        limit
      )
    },

    fetchMultiple(filters, limit = 100, timeout = 5000) {
      return new Promise(resolve => {
        const objects = {}
        const filtersWithLimit = Object.assign({}, filters, {limit})
        const sub = this.client.subscribe(filtersWithLimit, null, CloseAfter.EOSE)
        const timer = setTimeout(() => {
          sub.close()
          resolve(objects)
        }, timeout)
        sub.on('event', event => {
          objects[event.id] = this.addEvent(event)
          if (Object.keys(objects).length >= limit) {
            clearTimeout(timer)
            sub.close()
            resolve(objects)
          }
        })
        sub.on('close', () => {
          clearTimeout(timer)
          resolve(objects)
        })
      })
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

    streamFullProfile(pubkey) {
      // FIXME
      // const handles = []
      // // Everything authored by pubkey
      // handles.push(this.client.subscribe({
      //   kinds: [EventKind.NOTE],
      //   authors: [pubkey],
      //   limit: 200,
      // }, () => {}, { subId: 'foo' }))
      // handles.push(this.client.subscribe({
      //   kinds: [EventKind.REACTION],
      //   authors: [pubkey],
      //   limit: 100,
      // }))
      // handles.push(this.client.subscribe({
      //   kinds: [EventKind.METADATA, EventKind.CONTACT],
      //   authors: [pubkey],
      // }))
      // // handles.push(this.client.subscribe({
      // //   kinds: [EventKind.METADATA, EventKind.NOTE, EventKind.RELAY, EventKind.CONTACT, EventKind.REACTION],
      // //   authors: [pubkey],
      // // }))
      // // Followers
      // handles.push(this.client.subscribe({
      //   kinds: [EventKind.CONTACT],
      //   '#p': [pubkey],
      //   limit: 2000,
      // }))
      // return handles
    },

    cancelStream(subIds) {
      // FIXME
      if (!Array.isArray(subIds)) subIds = [subIds]
      for (const subId of subIds) {
        this.client.unsubscribe(subId)
      }
    },

    streamEvents(filters, initialFetchSize, eventCallback, initialFetchCompleteCallback, opts) {
      const filtersWithLimit = Object.assign({}, filters, {limit: initialFetchSize})

      let numEventsSeen = 0
      let initialFetchComplete = false

      const sub = this.client.subscribe(filtersWithLimit, opts.subId || null)
      const timer = setTimeout(() => {
        if (!initialFetchComplete) {
          initialFetchComplete = true
          if (initialFetchCompleteCallback) initialFetchCompleteCallback()
        }
      }, opts.timeout || 5000)
      sub.on('event', (event, relay) => {
        const known = this.hasEvent(event.id)
        const obj = this.addEvent(event, relay)
        if (!obj || known) return

        if (eventCallback) eventCallback(obj, relay)

        if (++numEventsSeen >= initialFetchSize && !initialFetchComplete) {
          initialFetchComplete = true
          clearTimeout(timer)
          if (initialFetchCompleteCallback) initialFetchCompleteCallback()
        }
      })
      sub.on('complete', () => {
        if (!initialFetchComplete) {
          initialFetchComplete = true
          clearTimeout(timer)
          if (initialFetchCompleteCallback) initialFetchCompleteCallback()
        }
      })

      return sub
    }
  },
})

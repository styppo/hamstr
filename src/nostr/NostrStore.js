import {defineStore} from 'pinia'
import {markRaw} from 'vue'
import {EventKind} from 'src/nostr/model/Event'
import NostrClient from 'src/nostr/NostrClient'
import FetchQueue from 'src/nostr/FetchQueue'
import {NoteOrder, useNoteStore} from 'src/nostr/store/NoteStore'
import {useProfileStore} from 'src/nostr/store/ProfileStore'
import {useContactStore} from 'src/nostr/store/ContactStore'
import {useSettingsStore, RELAYS} from 'stores/Settings'
import {useStatStore} from 'src/nostr/store/StatStore'
import {Observable} from 'src/nostr/utils'
import {CloseAfter} from 'src/nostr/Relay'
import DateUtils from 'src/utils/DateUtils'

class Stream extends Observable {
  constructor(sub) {
    super()
    this.sub = sub
    sub.on('close', this.emit.bind(this, 'close'))
  }

  close(relay = null) {
    this.sub.close(relay)
  }
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
      // FIXME Use relays from settings
      this.client = markRaw(new NostrClient(RELAYS))
      this.client.connect()

      this.profileQueue = profileQueue(this.client)
      this.profileQueue.on('event', this.addEvent.bind(this))

      this.noteQueue = eventQueue(this.client, 'note')
      this.noteQueue.on('event', this.addEvent.bind(this))

      this.contactQueue = contactQueue(this.client, 'queue')
      this.contactQueue.on('event', this.addEvent.bind(this))

      this.getProfiles(Object.keys(settings.accounts))
    },

    addEvent(event, relay = null) {
      // console.log(`[EVENT] from ${relay}`, event)

      if (relay?.url) {
        if (this.seenBy[event.id]) {
          this.seenBy[event.id][relay.url] = DateUtils.now()
        } else {
          this.seenBy[event.id] = {
            [relay.url]: DateUtils.now()
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
          // TODO
          return event
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

    publish(event) {
      this.addEvent(event)
      return this.client.publish(event)
    },

    getProfile(pubkey) {
      const profiles = useProfileStore()
      const profile = profiles.get(pubkey)
      if (!profile) this.profileQueue.add(pubkey)
      return profile
    },

    getProfiles(pubkeys) {
      const profiles = []
      for (const pubkey of pubkeys) {
        profiles.push(this.getProfile(pubkey))
      }
      return profiles
    },

    getNote(id) {
      const notes = useNoteStore()
      let note = notes.get(id)
      if (!note && !this.hasEvent(id)) this.noteQueue.add(id)
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

    fetchNotesByAuthor(pubkey, limit = 100) {
      return this.fetch(
        {
          kinds: [EventKind.NOTE],
          authors: [pubkey],
          limit,
        }
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

    fetchFollowers(pubkey, limit = 500) {
      return this.fetch(
        {
          kinds: [EventKind.CONTACT],
          '#p': [pubkey],
          limit,
        },
      )
    },

    getReactionsTo(id, order = NoteOrder.CREATION_DATE_DESC) {
      const store = useNoteStore()
      const reactions = store.reactionsTo(id, order)
      // TODO fetch?
      return reactions
    },

    fetchReactionsTo(id, limit = 500) {
      return this.fetch(
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
      return this.fetch(
        {
          kinds: [EventKind.REACTION],
          authors: [pubkey],
          limit,
        }
      )
    },

    async fetch(filters, opts = {}) {
      return new Promise(resolve => {
        const events = {}
        const sub = this.client.subscribe(filters, opts.subId, CloseAfter.EOSE)

        const timer = setTimeout(() => {
          const values = Object.values(events)
          console.log(`[TIMEOUT] fetch ${sub.subId} (${values.length})`, filters)
          sub.close()
          resolve(values)
        }, opts.timeout || 4000)

        sub.on('end', () => {
          const values = Object.values(events)
          console.log(`[COMPLETE] fetch ${sub.subId} (${values.length})`, filters)
          sub.close()
          clearTimeout(timer)
          resolve(values)
        })
        sub.on('close', () => {
          clearTimeout(timer)
          resolve(Object.values(events))
        })
        sub.on('event', (event, relay) => {
          const object = this.addEvent(event, relay)
          if (!object) {
            console.warn('Discarding event', event)
            return
          }
          events[event.id] = object
        })
      })
    },

    stream(filters, opts = {}) {
      let objects = {}
      const sub = this.client.subscribe(filters, opts.subId)
      const stream = new Stream(sub)

      const timer = setTimeout(() => {
        const values = Object.values(objects)
        console.log(`[TIMEOUT] stream ${sub.subId} (${values.length})`, filters)
        stream.emit('init', values)
        objects = null
      }, opts.timeout || 5000)

      sub.on('end', () => {
        clearTimeout(timer)
        const values = Object.values(objects)
        console.log(`[COMPLETE] stream ${sub.subId} (${values.length})`, filters)
        stream.emit('init', values)
        objects = null
      })
      sub.on('event', (event, relay) => {
        const known = this.hasEvent(event.id)
        const object = this.addEvent(event, relay)
        if (!object) {
          console.warn('Discarding event', event)
          return
        }
        if (known) return

        if (!objects) {
          stream.emit('update', object, relay, stream)
        } else {
          objects[event.id] = object
        }
      })

      return stream
    },

    streamThread(rootId) {
      return this.stream(
        {
          kinds: [EventKind.NOTE, EventKind.REACTION, EventKind.SHARE],
          '#e': [rootId],
          limit: 500,
        },
        {
          subId: `thread:${rootId}`,
        }
      )
    },

    streamNotifications(pubkey) {
      return this.stream(
        {
          kinds: [EventKind.NOTE, EventKind.REACTION], // TODO SHARE, CONTACT
          '#p': [pubkey],
          limit: 50,
        },
        {
          subId: `notifications:${pubkey}`,
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
  },
})

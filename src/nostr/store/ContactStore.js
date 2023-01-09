import {defineStore} from 'pinia'
import {EventKind, Tag} from 'src/nostr/model/Event'

export const useContactStore = defineStore('contact', {
  state: () => ({
    contacts: {},
    followers: {},
  }),
  getters: {
    getContacts(state) {
      return pubkey => state.contacts[pubkey]
    },
    getFollowers(state) {
      return pubkey => state.followers[pubkey]
    }
  },
  actions: {
    addEvent(event) {
      console.assert(event.kind === EventKind.CONTACT)

      const existingContacts = this.contacts[event.pubkey]
      if (existingContacts && existingContacts.lastUpdatedAt >= event.createdAt) {
        return
      }

      const newContacts = []
      newContacts.lastUpdatedAt = event.createdAt

      const tags = event.tags.filter(tag => tag[0] === Tag.PUBKEY && tag[1])
      for (const tag of tags) {
        newContacts.push({
          pubkey: tag[1],
          relay: tag[2],
          name: tag[3],
        })
      }

      if (existingContacts) {
        for (const contact of existingContacts) {
          this.removeFollower(contact.pubkey, event.pubkey)
        }
      }

      for (const contact of newContacts) {
        this.addFollower(contact.pubkey, event.pubkey)
      }
      this.contacts[event.pubkey] = newContacts

      return event
    },
    addFollower(to, follower) {
      if (this.followers[to]) {
        this.followers[to].push(follower)
      } else {
        this.followers[to] = [follower]
      }
    },
    removeFollower(from, follower) {
      const followers = this.followers[from]
      if (!followers) return
      const index = followers.indexOf(follower)
      if (index < 0) return
      followers.splice(index, 1)
    }
  }
})

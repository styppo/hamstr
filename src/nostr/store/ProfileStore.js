import {defineStore} from 'pinia'
import Profile from 'src/nostr/model/Profile'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profiles: {},
  }),
  getters: {
    get(state) {
      return pubkey => state.profiles[pubkey]
    },
    findByName(state) {
      return query => Object.values(state.profiles)
        .filter(profile => profile.name?.toLowerCase().startsWith(query?.toLowerCase()))
        .map(profile => profile.pubkey)
    },
    findByNip05(state) {
      return query => Object.values(state.profiles)
        .filter(profile => profile.nip05.url?.toLowerCase().endsWith(query?.toLowerCase()))
        .map(profile => profile.pubkey)
    },
  },
  actions: {
    addEvent(event) {
      const profile = Profile.from(event)
      if (!profile) return false

      const existing = this.profiles[profile.pubkey]
      if (!existing || existing.lastUpdatedAt < profile.lastUpdatedAt) {
        this.profiles[profile.pubkey] = profile
      }

      return this.profiles[profile.pubkey]
    }
  }
})

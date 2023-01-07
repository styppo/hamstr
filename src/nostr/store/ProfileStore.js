import {defineStore} from 'pinia'
import Profile from 'src/nostr/model/Profile'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profiles: {},
  }),
  getters: {
    get(state) {
      return pubkey => state.profiles[pubkey]
    }
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

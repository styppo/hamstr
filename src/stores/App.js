import {defineStore} from 'pinia'
import {useSettingsStore} from 'stores/Settings'

export const useAppStore = defineStore('app', {
  state: () => ({
    signInDialog: {
      open: false,
      fragment: null,
      callback: null,
    },
    createPostDialog: {
      open: false,
      params: {},
    },
  }),
  getters: {
    activeAccount(state) {
      const settings = useSettingsStore()
      return settings.activeAccount
    },
    isSignedIn(state) {
      return !!this.activeAccount
    },
    myPubkey(state) {
      return this.activeAccount?.pubkey
    },
  },
  actions: {
    signIn(fragment = 'welcome') {
      return new Promise(resolve => {
        this.signInDialog.callback = resolve
        this.signInDialog.fragment = fragment
        this.signInDialog.open = true
      })
    },
    signInIfNeeded(fragment = 'welcome') {
      if (this.isSignedIn) return Promise.resolve(true)
      return this.signIn(fragment)
    },
    async createPost(options = {}) {
      if (!await this.signInIfNeeded()) return
      this.createPostDialog.params = options
      this.createPostDialog.open = true
    },
    signEvent(event) {
      // TODO Check if signing is possible, prompt for privkey
      return this.activeAccount.sign(event)
    }
  },
})

import {defineStore} from 'pinia'
import {useSettingsStore} from 'stores/Settings'
import {useNostrStore} from 'src/nostr/NostrStore'

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
    activeAccount() {
      const settings = useSettingsStore()
      return settings.activeAccount
    },
    isSignedIn() {
      return !!this.activeAccount
    },
    myPubkey() {
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
    switchAccount(pubkey) {
      const settings = useSettingsStore()
      settings.switchAccount(pubkey)
      const nostr = useNostrStore()
      nostr.subscribeForUser(pubkey)
    },
    async createPost(options = {}) {
      if (!await this.signInIfNeeded()) return
      this.createPostDialog.params = options
      this.createPostDialog.open = true
    },
    async signEvent(event) {
      if (!await this.signInIfNeeded()) return
      if (!this.activeAccount.canSign() && !await this.signIn('private-key')) return
      return this.activeAccount.sign(event)
    }
  },
})

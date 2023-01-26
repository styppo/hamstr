import {defineStore} from 'pinia'
import {useSettingsStore} from 'stores/Settings'
import {useNostrStore} from 'src/nostr/NostrStore'
import {markRaw} from 'vue'
import JobQueue from 'src/utils/JobQueue'

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
    queue: markRaw(new JobQueue()),
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
      return this.queue.push(
        () => new Promise(resolve => {
          this.signInDialog.callback = resolve
          this.signInDialog.fragment = fragment
          this.signInDialog.open = true
        })
      )
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
      return await this.activeAccount.sign(event)
    },
    async decryptMessage(pubkey, content) {
      if (!await this.signInIfNeeded()) return
      if (!this.activeAccount.canDecrypt() && !await this.signIn('private-key')) return
      return await this.activeAccount.decrypt(pubkey, content)
    },
    async encryptMessage(pubkey, content) {
      if (!await this.signInIfNeeded()) return
      if (!this.activeAccount.canEncrypt() && !await this.signIn('private-key')) return
      return await this.activeAccount.encrypt(pubkey, content)
    },
  },
})

import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    accounts: {}, // TODO move to own store?

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
    isSignedIn(state) {
      return !!state.user
    },
    myPubkey(state) {
      return state.user?.pubkey
    },
  },
  actions: {
    signIn(fragment = 'welcome') {
      if (this.isSignedIn) return Promise.resolve(true)
      return new Promise(resolve => {
        this.signInDialog.callback = resolve
        this.signInDialog.fragment = fragment
        this.signInDialog.open = true
      })
    },
    async createPost(options = {}) {
      if (!await this.signIn()) return
      this.createPostDialog.params = options
      this.createPostDialog.open = true
    },
  },
})

import {defineStore} from 'pinia'
import {getEventHash, getPublicKey, signEvent} from 'nostr-tools'
import Nip07 from 'src/utils/Nip07'

export class Account {
  constructor(opts) {
    this.pubkey = opts.pubkey || null
    this.privkey = opts.privkey || null
    this.useExtension = opts.useExtension || false

    if (this.privkey && !this.pubkey) {
      this.pubkey = getPublicKey(this.privkey)
    }

    if (!this.pubkey) throw new Error('pubkey is required')
  }

  canSign() {
    return !!this.privkey || (this.useExtension && Nip07.isAvailable())
  }

  async sign(event) {
    event.id = getEventHash(event)
    if (this.privkey) {
      event.sig = signEvent(event, this.privkey)
    } else if (this.useExtension && Nip07.isAvailable()) {
      let {sig} = await Nip07.signEvent(event)
      event.sig = sig
    } else {
      // TODO
      throw new Error('cannot sign')
    }
    return event
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    accounts: {},
    pubkey: null,
    relays: []
  }),
  getters: {
    activeAccount(state) {
      const account = state.accounts[state.pubkey]
      if (!account) return
      return new Account(account)
    },
    hasAccount(state) {
      return pubkey => !!state.accounts[pubkey]
    },
  },
  actions: {
    addAccount(opts) {
      const account = new Account(opts)
      this.accounts[account.pubkey] = account
      if (!this.pubkey) {
        this.pubkey = account.pubkey
      }
      return account
    },
    removeAccount(pubkey) {
      delete this.accounts[pubkey]
      if (this.pubkey === pubkey) {
        this.pubkey = null
      }
    },
    switchAccount(pubkey) {
      if (!this.accounts[pubkey]) throw new Error(`unknown account ${pubkey}`)
      this.pubkey = pubkey
    },
    addRelay(url) {
      this.relays.push(url)
    },
    removeRelay(url) {
      const idx = this.relays.indexOf(url)
      if (idx < 0) return
      this.relays.splice(idx, 1)
    }
  },
  persist: true,
})

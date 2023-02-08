import {defineStore} from 'pinia'
import {Account} from 'src/nostr/Account'

const RELAYS = [
  'wss://relay.snort.social',
  'wss://relay.nostr.ch',
  'wss://nos.lol',
  'wss://nostr-pub.semisol.dev',
  'wss://nostr.einundzwanzig.space',
  'wss://nostr.sg',
]
const RELAYS_VERSION = 2

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    accounts: {},
    pubkey: null,
    relays: [].concat(RELAYS),
    relaysVersion: 0,
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
    hasRelay(state) {
      return url => state.relays.indexOf(url) >= 0
    },
  },
  actions: {
    init() {
      if (this.relaysVersion < RELAYS_VERSION && this.hasSubsetOfDefaultRelays()) {
        this.relays = [].concat(RELAYS)
        this.relaysVersion = RELAYS_VERSION
      }
    },
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
        const accounts = Object.keys(this.accounts)
        if (accounts.length) {
          this.pubkey = accounts[0]
        } else {
          this.pubkey = null
        }
      }
    },
    switchAccount(pubkey) {
      if (!this.accounts[pubkey]) throw new Error(`unknown account ${pubkey}`)
      this.pubkey = pubkey
    },
    addRelay(url) {
      if (this.hasRelay(url)) return
      this.relays.push(url)
    },
    removeRelay(url) {
      const idx = this.relays.indexOf(url)
      if (idx >= 0) this.relays.splice(idx, 1)
    },
    restoreDefaultRelays() {
      this.relays = [].concat(RELAYS)
    },
    hasDefaultRelays() {
      return this.relays.length === RELAYS.length
        && this.relays.every((url, idx) => url === RELAYS[idx])
    },
    hasSubsetOfDefaultRelays() {
      return this.relays.length < RELAYS.length
        && this.relays.every((url, idx) => RELAYS.indexOf(url) >= 0)
    },
  },
  persist: true,
})

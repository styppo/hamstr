import {defineStore} from 'pinia'
import Message from 'src/nostr/model/Message'
import {NoteOrder} from 'src/nostr/store/NoteStore'
import DateUtils from 'src/utils/DateUtils'

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: {}, // id -> message
    byRecipient: {}, // recipient -> sender -> [messages]
    bySender: {}, // sender -> recipient -> [messages]
  }),
  getters: {
    getConversations(state) {
      return pubkey => {
        const conversations = []
        for (const counterparty of this.getCounterparties(pubkey)) {
          const messages = this.getMessages(pubkey, counterparty)
          const latestMessage = messages.reduce((a, b) => a.createdAt > b.createdAt ? a : b, {createdAt: 0})
          const lastRead = useMessageStatusStore().getLastRead(pubkey, counterparty)
          const numUnread = messages.filter(msg => msg.createdAt > lastRead).length
          conversations.push({
            pubkey: counterparty,
            latestMessage,
            numUnread,
          })
        }
        conversations.sort((a, b) => b.latestMessage?.createdAt - a.latestMessage?.createdAt)
        return conversations
      }
    },
    getConversation() {
      // TODO Take e-tags into account for sorting
      return (pubkey, counterparty) => this
        .getMessages(pubkey, counterparty)
        .sort(NoteOrder.CREATION_DATE_ASC)
    },
    getMessages(state) {
      return (pubkey, counterparty) => (state.byRecipient[pubkey]?.[counterparty] || [])
        .concat(pubkey !== counterparty
          ? state.bySender[pubkey]?.[counterparty] || []
          : []
        )
    },
    getCounterparties(state) {
      return pubkey => {
        const counterparties = new Set()
        Object.keys(state.byRecipient[pubkey] || {}).forEach(pubkey => counterparties.add(pubkey))
        Object.keys(state.bySender[pubkey] || {}).forEach(pubkey => counterparties.add(pubkey))
        return Array.from(counterparties)
      }
    },
    getNumUnread() {
      // TODO improve performance
      return pubkey => this.getConversations(pubkey).reduce((sum, conv) => sum + conv.numUnread, 0)
    },
  },
  actions: {
    addEvent(event) {
      const message = Message.from(event)
      if (!message) return false

      if (this.messages[message.id]) return this.messages[message.id]
      this.messages[message.id] = message

      if (!this.bySender[message.author]) {
        this.bySender[message.author] = {}
      }
      const byRecipient = this.bySender[message.author]

      for (const recipient of message.recipients) {
        if (!byRecipient[recipient]) {
          byRecipient[recipient] = []
        }
        byRecipient[recipient].push(message)

        if (!this.byRecipient[recipient]) {
          this.byRecipient[recipient] = {}
        }
        const bySender = this.byRecipient[recipient]
        if (!bySender[message.author]) {
          bySender[message.author] = []
        }
        bySender[message.author].push(message)
      }

      return message
    },
    markAsRead(pubkey, counterparty) {
      return useMessageStatusStore().markAsRead(pubkey, counterparty)
    },
    markAllAsRead(pubkey) {
      const store = useMessageStatusStore()
      for (const counterparty of this.getCounterparties(pubkey)) {
        store.markAsRead(pubkey, counterparty)
      }
    },
  }
})

const useMessageStatusStore = defineStore('message-status', {
  state: () => ({
    lastRead: {} // recipient -> sender -> lastReadTimestamp
  }),
  getters: {
    getLastRead(state) {
      return (pubkey, counterparty) => state.lastRead[pubkey]?.[counterparty] || 0
    }
  },
  actions: {
    markAsRead(pubkey, counterparty) {
      if (!this.lastRead[pubkey]) {
        this.lastRead[pubkey] = {}
      }
      this.lastRead[pubkey][counterparty] = DateUtils.now()
    },
  },
  persist: true
})

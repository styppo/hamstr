<template>
  <button
    v-if="app.isSignedIn"
    class="btn btn-sm"
    :class="{ 'btn-primary': !isFollowing }"
    @click="toggleFollow"
  >
    {{ $t(isFollowing ? "Unfollow" : "Follow") }}
  </button>
</template>

<script>
import { useNostrStore } from 'src/nostr/NostrStore'
import { useAppStore } from 'stores/App'
import EventBuilder from 'src/nostr/EventBuilder'
import { $t } from 'src/boot/i18n'

export default {
  name: 'FollowButton',
  props: {
    pubkey: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  computed: {
    contacts() {
      return this.nostr.getContacts(this.app.myPubkey)
    },
    isFollowing() {
      // TODO improve
      return (
        this.contacts?.length &&
        this.contacts.find((contact) => contact.pubkey === this.pubkey)
      )
    },
  },
  methods: {
    async updateContacts(contacts) {
      const event = EventBuilder.contacts(
        this.app.myPubkey,
        contacts.map((c) => c.pubkey)
      ).build()
      if (!(await this.app.signEvent(event))) return
      if (!(await this.nostr.publish(event))) {
        this.$q.notify({
          message: $t('Failed to update followers'),
          color: 'negative',
        })
      }
    },
    toggleFollow() {
      return this.isFollowing ? this.unfollow() : this.follow()
    },
    async follow() {
      const contacts = [].concat(this.contacts || []) // Clone array
      contacts.push({ pubkey: this.pubkey })
      await this.updateContacts(contacts)
    },
    async unfollow() {
      const contacts = [].concat(this.contacts || []) // Clone array
      const idx = contacts.findIndex(
        (contact) => contact.pubkey === this.pubkey
      )
      contacts.splice(idx, 1)
      await this.updateContacts(contacts)
    },
  },
}
</script>

<style scoped>
</style>

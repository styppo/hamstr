<template>
  <button
    v-if="app.isSignedIn"
    class="btn btn-sm"
    :class="{'btn-primary': !isFollowing}"
    @click="toggleFollow"
  >
    {{ isFollowing ? 'Unfollow' : 'Follow' }}
  </button>
</template>

<script>
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
import Event, {EventKind, TagType} from 'src/nostr/model/Event'

export default {
  name: 'FollowButton',
  props: {
    pubkey: {
      type: String,
      required: true,
    }
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
      return this.contacts?.length && this.contacts.find(contact => contact.pubkey === this.pubkey)
    },
  },
  methods: {
    // TODO Move this logic somewhere else
    buildEvent(contacts) {
      return Event.fresh({
        pubkey: this.app.myPubkey,
        kind: EventKind.CONTACT,
        tags: this.buildTags(contacts),
        content: '',
      })
    },
    buildTags(contacts) {
      const tags = []
      for (const contact of contacts) {
        tags.push([TagType.PUBKEY, contact.pubkey])
      }
      return tags
    },
    async updateContacts(contacts) {
      const event = this.buildEvent(contacts)
      await this.app.signEvent(event)
      this.nostr.publish(event)
    },
    toggleFollow() {
      return this.isFollowing
        ? this.unfollow()
        : this.follow()
    },
    async follow() {
      const contacts = [].concat(this.contacts || []) // Clone array
      contacts.push({pubkey: this.pubkey})
      await this.updateContacts(contacts)
    },
    async unfollow() {
      const contacts = [].concat(this.contacts || []) // Clone array
      const idx = contacts.findIndex(contact => contact.pubkey === this.pubkey)
      contacts.splice(idx, 1)
      await this.updateContacts(contacts)
    },
  },
}
</script>

<style scoped>

</style>

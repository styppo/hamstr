<template>
  <button
    v-if="app.isSignedIn"
    class="btn"
    :class="{'btn-primary': !isFollowing}"
  >
    {{ isFollowing ? 'Unfollow' : 'Follow' }}
  </button>
</template>

<script>
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'

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
    isFollowing() {
      // TODO improve
      const contacts = this.nostr.getContacts(this.app.myPubkey)
      return contacts?.length && contacts.find(contact => contact.pubkey === this.pubkey)
    }
  }
}
</script>

<style scoped>

</style>

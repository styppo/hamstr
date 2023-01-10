<template>
  <div v-if="app.isSignedIn" class="following">
    <div class="following-wrapper">
      <div class="following-header">
        <h3>Following</h3>
      </div>
      <div
        v-if="contacts?.length"
        class="following-body"
      >
        <UserCard
          v-for="contact in contacts"
          :key="contact.pubkey"
          :pubkey="contact.pubkey"
          class="following-body-item"
          clickable
          @click="goToProfile(contact.pubkey)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UserCard from 'components/User/UserCard.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
import routerMixin from 'src/router/mixin'

export default {
  name: 'FollowingBox',
  components: {UserCard},
  mixins: [routerMixin],
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  computed: {
    pubkey() {
      return this.app.myPubkey
    },
    contacts() {
      return this.nostr.getContacts(this.pubkey)?.slice(0, 20)
    }
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.following {
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  &-wrapper {
  }
  &-header {
    padding: 1rem;
    h3 {
      margin: 0;
      font-size: 1.4rem;
      color: #fff;
    }
  }
  &-body {
    &-item {
      margin: 0;
      padding: 12px 1rem;
      border-top: $border-dark;
      transition: 200ms ease;
      cursor: pointer;
      &:last-child {
        border-radius: 0 0 1rem 1rem;
      }
      &:hover {
        background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
      }
    }
  }
}
</style>

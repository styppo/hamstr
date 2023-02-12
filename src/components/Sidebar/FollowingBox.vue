<template>
  <div v-if="app.isSignedIn && contacts?.length" class="following">
    <div class="following-wrapper">
      <div class="following-header">
        <h3>{{ $t("Following") }}</h3>
      </div>
      <div class="following-body">
        <UserCard
          v-for="contact in contacts"
          :key="contact.pubkey"
          :pubkey="contact.pubkey"
          class="following-body-item"
          clickable
          @click="goToProfile(contact.pubkey)"
        />
      </div>
      <div class="following-gradient"></div>
    </div>
  </div>
</template>

<script>
import UserCard from 'components/User/UserCard.vue'
import { useNostrStore } from 'src/nostr/NostrStore'
import { useAppStore } from 'stores/App'
import routerMixin from 'src/router/mixin'

export default {
  name: 'FollowingBox',
  components: { UserCard },
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
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.following {
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  &-wrapper {
    position: relative;
  }
  &-header {
    padding: 1rem;
    border-bottom: $border-dark;
    h3 {
      margin: 0;
      font-size: 1.4rem;
      color: #fff;
    }
  }
  &-body {
    max-height: calc(100vh - 150px);
    overflow-y: scroll;
    scrollbar-color: transparent transparent;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    &::-webkit-scrollbar-thumb {
      /* Foreground */
      background: $color-dark-gray;
    }
    &::-webkit-scrollbar-track {
      /* Background */
      background: transparent;
    }
    &-item {
      margin: 0;
      padding: 12px 1rem;
      border-top: $border-dark;
      transition: 200ms ease;
      cursor: pointer;
      &:first-child {
        border-top: 0;
      }
      &:last-child {
        border-radius: 0 0 1rem 1rem;
      }
      &:hover {
        background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
      }
    }
  }
  &-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.2rem;
    border-radius: 0 0 1rem 1rem;
    background: linear-gradient(
      180deg,
      rgba(29, 41, 53, 0),
      rgba(29, 41, 53, 1)
    );
  }
}
</style>

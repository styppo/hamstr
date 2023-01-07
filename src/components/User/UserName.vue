<template>
  <span
    class="username"
    :class="{'two-line': twoLine, clickable}"
  >
    <a @click="clickable && linkToProfile(pubkey)">
      <span
        v-if="profile?.name"
        class="name"
      >
        {{ profile.name }}
        <q-icon v-if="showFollowing && isFollow" name="visibility" color="secondary">
          <q-tooltip>
            following
          </q-tooltip>
        </q-icon>
      </span>
      <Bech32Label v-if="twoLine || !profile?.name" prefix="npub" :hex="pubkey" class="pubkey" />
    </a>

    <span v-if="showVerified && profile?.nip05?.verified">
      <Nip05Badge :pubkey="pubkey" />
      <span style="opacity: .9; font-size: 90%; font-weight: 300; line-height: 90%">
        {{ niceNip05 }}
      </span>
    </span>
  </span>
</template>

<script>
import Nip05Badge from 'components/User/Nip05Badge.vue'
import Bech32Label from 'components/Bech32Label.vue'
import routerMixin from 'src/router/mixin'
import {useNostrStore} from 'src/nostr/NostrStore'

export default {
  mixins: [routerMixin],
  components: {
    Bech32Label,
    Nip05Badge,
  },
  props: {
    pubkey: {
      type: String,
      required: true
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    twoLine: {
      type: Boolean,
      default: false
    },
    showFollowing: {
      type: Boolean,
      default: false
    },
    showVerified: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    return {
      nostr: useNostrStore()
    }
  },
  computed: {
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    niceNip05() {
      return this.profile.nip05.url
        .split('@')
        .filter(part => part !== '_' && part !== this.profile.name)
        .join('@')
    },
    isFollow() {
      // FIXME
      return false
    },
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.username {
  cursor: pointer;
  .name {
    font-weight: bold;
  }
  > span + span {
    margin-left: 8px;
  }
  &.two-line {
    display: block;
    > a > span {
      display: block;
      margin-left: 0;
    }
    .pubkey:not(:first-child) {
      color: $color-dark-gray;
      .pubkey-value {
        font-weight: normal;
      }
    }
  }
  &.clickable {
    .name:hover {
      text-decoration: underline;
    }
    .pubkey:first-child:hover {
      text-decoration: underline;
    }
  }
}
</style>

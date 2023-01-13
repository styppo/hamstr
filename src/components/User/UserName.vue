<template>
  <span
    class="username"
    :class="{'two-line': twoLine, clickable, header}"
  >
    <a @click="clickable && goToProfile(pubkey)">
      <span v-if="profile?.name" class="name">
        {{ profile.name }}
      </span>
<!--      <q-icon v-if="showFollowing && isFollow" name="visibility" color="secondary">-->
<!--        <q-tooltip>-->
<!--          following-->
<!--        </q-tooltip>-->
<!--      </q-icon>-->
      <Bech32Label v-if="twoLine || !profile?.name" prefix="npub" :hex="pubkey" class="pubkey" />
    </a>

    <Nip05Badge :pubkey="pubkey" />
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
    header: {
      type: Boolean,
      default: false,
    },
    showFollowing: {
      type: Boolean,
      default: false
    },
    showVerified: {
      type: Boolean,
      default: true
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
    isFollow() {
      // FIXME
      return false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.username {
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
    cursor: pointer;
    .name:hover {
      text-decoration: underline;
    }
    .pubkey:first-child:hover {
      text-decoration: underline;
    }
  }
  &.header {
    .name, .pubkey:first-child {
      font-size: 1.5rem;
    }
  }
}
</style>

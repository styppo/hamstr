<template>
  <span
    class="username"
    :class="{'two-line': twoLine, clickable, header}"
  >
    <span class="name">
      <a @click="clickable && goToProfile(pubkey)">
        <span v-if="profile?.name">
          {{ profile.name }}
        </span>
        <Bech32Label v-else prefix="npub" :hex="pubkey" />
      </a>
      <Nip05Badge v-if="showVerified" :pubkey="pubkey" :size="header ? '18px' : '14px'" class="verified-badge" />
    </span>

    <Bech32Label v-if="twoLine && profile?.name" prefix="npub" :hex="pubkey" class="pubkey" />
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
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.username {
  .name {
    display: inline-flex;
    align-items: center;
    a {
      font-weight: 600;
    }
    .verified-badge {
      margin: 0 4px;
    }
  }
  .pubkey {
    color: $color-dark-gray;
    display: block;
    line-height: 1rem;
  }
  &.two-line {
    display: block;
  }
  &.clickable {
    cursor: pointer;
    .name a:hover {
      text-decoration: underline;
    }
  }
  &.header {
    .name {
      font-size: 1.5rem;
    }
  }
}

@media screen and (max-width: $phone-lg) {
  .username.two-line {
    .name {
      display: block;
      .verified-badge {
        margin-left: 0;
      }
    }
    a {
      margin-right: 4px;
    }
  }
}
</style>

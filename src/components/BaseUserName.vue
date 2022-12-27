<template>
  <span
    :class="'username' + (wrap ? ' two-line' : '')"
  >
    <a @click.stop="toProfile(pubkey)">
      <span
        v-if="$store.getters.name(pubkey)"
        class="name"
      >
        {{ $store.getters.name(pubkey) }}
        <q-icon v-if="showFollowing && isFollow" name="visibility" color="secondary">
          <q-tooltip>
            following
          </q-tooltip>
        </q-icon>
      </span>
      <span v-if="wrap || !$store.getters.name(pubkey)" class="pubkey">
        <span class="pubkey-prefix">npub</span>
        <span class="pubkey-value">{{ shorten(pubkey) }}</span>
      </span>
    </a>

    <span v-if="$store.getters.NIP05Id(pubkey)">
      <BaseButtonNIP05 :pubkey="pubkey" />
      <span style="opacity: .9; font-size: 90%; font-weight: 300; line-height: 90%">
        {{ niceNIP05 }}
      </span>
    </span>
  </span>
</template>

<script>
import helpersMixin from '../utils/mixin'
import BaseButtonNIP05 from 'components/BaseButtonNIP05.vue'

export default {
  mixins: [helpersMixin],
  components: {
    BaseButtonNIP05,
  },
  props: {
    pubkey: {
      type: String,
      required: true
    },
    wrap: {
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
  computed: {
    niceNIP05() {
      return this.$store.getters.NIP05Id(this.pubkey)
        .split('@')
        .map(el => (el === '_' || el === this.$store.getters.name(this.pubkey)) ? '' : el).join('@')
    },
    isFollow() {
      return this.$store.state.follows.includes(this.pubkey)
    },
  }
}
</script>

<style lang="scss">
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
  .name:hover {
    text-decoration: underline;
  }
  .pubkey {
    &-prefix {
      font-size: 0.7em;
      opacity: .9;
    }
    &-value {
      font-weight: bold;
    }
  }
}
</style>

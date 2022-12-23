<template>
  <span
    class="cursor-pointer username"
    @click.stop="toProfile(pubkey)"
  >
    <span
      v-if="$store.getters.name(pubkey)"
      class="text-bold"
    >
      {{ $store.getters.name(pubkey) }}
      <q-icon v-if="showFollowing && isFollow" name="visibility" color="secondary">
        <q-tooltip>
          following
        </q-tooltip>
      </q-icon>
    </span>
    <span v-else class="text-italic">anonymous</span>
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
    pubkey: {type: String, required: true},
    wrap: {type: Boolean, default: false},
    showFollowing: {type: Boolean, default: false},
    showVerified: {type: Boolean, default: false},
  },
  computed: {
    niceNIP05() {
      return this.$store.getters.NIP05Id(this.pubkey)
        .split('@')
        .map(el => (el === '_' || el === this.$store.getters.name(this.pubkey)) ? '' : el).join('@')
    },
    isFollow() {
      return this.$store.state.follows.includes(this.pubkey)
    }
  }
  // methods: {
  //   openNIP05() {
  //     let [name, domain] = this.$store.getters
  //       .displayName(this.pubkey)
  //       .split('@')
  //     if (!domain) {
  //       domain = name
  //       name = '_'
  //     }
  //     window.open(`https://${domain}/.well-known/nostr.json?name=${name}`)
  //   }
  // }
}
</script>

<style lang="scss">
.username {
  > span + span {
    margin-left: 8px;
  }
}
</style>

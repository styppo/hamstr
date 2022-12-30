<template>
  <q-avatar
    :size="size"
    @click="clickable && toProfile(pubkey)"
    class="relative-position"
    :class="{'cursor-pointer': clickable}"
  >
    <img
      v-if="hasAvatar(pubkey) && !avatarFetchFailed"
      :src="avatarUrl(pubkey)"
      ref="image"
      loading="lazy"
      crossorigin
      @error.once="onFetchFailed"
    />
    <Identicon
      v-if="!hasAvatar(pubkey) || avatarFetchFailed"
      :pubkey="pubkey"
    />
    <div :class="alignRight ? 'icon-right' : 'icon-left'" class="q-pt-xs">
      <BaseButtonNIP05
        v-if="showVerified"
        :pubkey="pubkey"
        button-size="xs"
      />
    </div>
  </q-avatar>
</template>

<script>
import helpersMixin from '../utils/mixin'
import BaseButtonNIP05 from 'components/BaseButtonNIP05.vue'
import Identicon from 'components/Identicon.vue'

export default {
  mixins: [helpersMixin],
  components: {
    BaseButtonNIP05,
    Identicon,
  },
  props: {
    pubkey: {
      type: String,
      required: true
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    alignRight: {type: Boolean, default: false},
    size: {type: String, default: ''},
    showVerified: {type: Boolean, default: false},
    hoverEffect: {type: Boolean, default: false},
  },
  data() {
    return {
      avatarFetchFailed: false,
    }
  },
  methods: {
    hasAvatar(pubkey) {
      return !!this.avatarUrl(pubkey)
    },
    avatarUrl(pubkey) {
      return this.$store.getters.avatar(pubkey)
    },
    onFetchFailed(event) {
      this.avatarFetchFailed = true
    }
  },
  mounted() {
    //console.log(this.$refs.image)
  }
}
</script>

<style lang="scss" scoped>
.icon-right {
  position: absolute;
  top: -.4rem;
  right: -.5rem;
}
.icon-left {
  position: absolute;
  top: -.4rem;
  left: -.5rem;
}
</style>

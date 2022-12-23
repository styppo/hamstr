<template>
  <div :class="(bordered ? 'bordered-avatar' : '') + (hoverEffect ? ' hovered-avatar' : '')">
    <q-avatar
      :rounded="!round"
      :size="size"
      @click.stop="toProfile(pubkey)"
      class="relative-position"
    >
      <img
        :src="$store.getters.avatar(pubkey)"
        loading="lazy"
        crossorigin
        @error.once="setDefaultAvatar"
      />
      <div :class="alignRight ? 'icon-right' : 'icon-left'" class="q-pt-xs">
        <BaseButtonNIP05
          v-if="showVerified"
          :pubkey="pubkey"
          button-size="xs"
        />
      </div>
    </q-avatar>
  </div>
</template>

<script>
import helpersMixin from '../utils/mixin'
import BaseButtonNIP05 from 'components/BaseButtonNIP05.vue'
import Identicon from 'identicon.js'

export default {
  mixins: [helpersMixin],
  components: {
    BaseButtonNIP05,
  },
  props: {
    pubkey: {type: String, required: true},
    alignRight: {type: Boolean, default: false},
    size: {type: String, default: ''},
    round: {type: Boolean, default: false},
    bordered: {type: Boolean, default: false},
    showVerified: {type: Boolean, default: false},
    hoverEffect: {type: Boolean, default: false},
  },
  methods: {
    setDefaultAvatar(event) {
      event.target.src = 'data:image/png;base64,' + new Identicon(this.pubkey, 40).toString()
    }
  }
}
</script>

<style lang='css' scoped>
.bordered-avatar .q-avatar img {
  border: 2px solid var(--q-accent);
  background: var(--q-background);
  z-index: 1;
}
.hovered-avatar .q-avatar:hover {
  transform: scale(1.5) translateX(.25rem);
}
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

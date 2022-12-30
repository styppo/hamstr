<template>
  <svg></svg>
</template>

<script>
import {updateSvg} from 'jdenticon'

export default {
  name: 'Identicon',
  props: {
    pubkey: {
      type: String,
      required: true,
    }
  },
  watch: {
    pubkey(pubkey) {
      updateSvg(this.$el, pubkey)
    }
  },
  mounted() {
    updateSvg(this.$el, this.pubkey)
  }
}
</script>

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
  mounted() {
    updateSvg(this.$el, this.pubkey)
  }
}
</script>

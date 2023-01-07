<template>
  <span class="bech32">
    <span class="bech32-prefix">{{ computedPrefix }}</span>
    <span class="bech32-value">{{ value }}</span>
  </span>
</template>

<script>
import {hexToBech32} from 'src/utils/utils'

export default {
  name: 'Bech32Label',
  props: {
    bech32: {
      type: String,
      default: null,
    },
    hex: {
      type: String,
      default: null,
    },
    prefix: {
      type: String,
      default: '',
    },
  },
  computed: {
    computedPrefix() {
      return this.bech32
        ? this.bech32.substring(0, 4)
        : this.prefix
    },
    value() {
      const value = this.bech32
        ? this.bech32.substring(4)
        : hexToBech32(this.hex, '')
      return this.shorten(value)
    },
  },
  methods: {
    shorten(str) {
      return str.substr(0, 5) + '…' + str.substr(-5)
    }
  }
}
</script>

<style lang="scss" scoped>
.bech32 {
  &-prefix {
    font-size: 0.7em;
    opacity: .9;
  }
  &-value {
    font-weight: 500;
  }
}
</style>

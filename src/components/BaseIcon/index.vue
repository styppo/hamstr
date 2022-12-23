<template>
  <component :is="iconComponent" />
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'BaseIcon',
  props: {
    icon: {
      type: String,
      default: 'home'
    },
  },
  computed: {
    iconComponent() {
      return defineAsyncComponent(() => import(`./icons/${this.icon}.vue`))
    }
  }
}
</script>

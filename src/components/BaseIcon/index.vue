<template>
  <component :is="iconComponent" />
</template>

<script>
import {defineComponent, defineAsyncComponent} from 'vue'

export default defineComponent({
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
})
</script>

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
  data() {
    return {
      name: this.icon,
    }
  },
  computed: {
    iconComponent() {
      this.name
      return defineAsyncComponent(() => import(`./icons/${this.name}.vue`))
    }
  },
  watch: {
    icon(icon) {
      this.name = icon
    }
  }
})
</script>

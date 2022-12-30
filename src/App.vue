<template>
  <main-layout />
</template>

<script>
//import { defineComponent } from 'vue'
import MainLayout from 'layouts/MainLayout.vue'

export default {
  name: 'App',
  components: {
    MainLayout
  },
  mounted() {
    // TODO Find a better place to put this
    this.$store.dispatch('prefetchAccounts')
  },
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  &::before, &::after {
    box-sizing: inherit;
  }
}

html, body, :root {
  font-size: 14px;
}

@import 'assets/theme/colors.scss';

body {
  background-color: $color-bg !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
</style>

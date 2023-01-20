<template>
  <MainLayout />
</template>

<script>
import {defineComponent} from 'vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import MainLayout from 'layouts/MainLayout.vue'

export default defineComponent({
  name: 'App',
  components: {
    MainLayout
  },
  setup() {
    useNostrStore().init()
  }
})
</script>

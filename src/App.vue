<template>
  <MainLayout />
</template>

<script>
import {defineComponent} from 'vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useSettingsStore} from 'stores/Settings'
import MainLayout from 'layouts/MainLayout.vue'

export default defineComponent({
  name: 'App',
  components: {
    MainLayout
  },
  setup() {
    useSettingsStore().init()
    useNostrStore().init()
  }
})
</script>

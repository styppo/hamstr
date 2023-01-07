<template>
  <q-layout>
    Test
    <div>Pubkey: {{ profile?.name }}</div>
    <div>Pubkey: {{ profile2?.name }}</div>
    <div>SignedIn: {{ app.isSignedIn }}</div>
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'

export default defineComponent({
  name: 'TestLayout',
  props: {
    pubkey: {
      type: String,
      default: '6f32dddf2d54f2c5e64e1570abcb9c7a05e8041bac0ee9f4235f694fccb68b5d',
    },
    pubkey2: {
      type: String,
      default: '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
    }
  },
  computed: {
    profile() {
      console.log('profile')
      return this.nostr.getProfile(this.pubkey)
    },
    profile2() {
      console.log('profile2')
      return this.nostr.getProfile(this.pubkey2)
    }
  },
  setup() {
    return {
      nostr: useNostrStore(),
      app: useAppStore(),
    }
  },
})

</script>

<style lang="scss" scoped>

</style>

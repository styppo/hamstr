<template>
  <q-avatar
    @click="clickable && linkToProfile(pubkey)"
    class="relative-position"
    :class="{'cursor-pointer': clickable}"
  >
    <img
      v-if="hasAvatar && !avatarFetchFailed"
      :src="avatarUrl"
      ref="image"
      loading="lazy"
      crossorigin
      @error.once="onFetchFailed"
    />
    <Identicon
      v-if="!hasAvatar || avatarFetchFailed"
      :pubkey="pubkey"
    />
  </q-avatar>
</template>

<script>
import Identicon from 'components/User/Identicon.vue'
import routerMixin from 'src/router/mixin'
import {useNostrStore} from 'src/nostr/NostrStore'

export default {
  mixins: [routerMixin],
  components: {
    Identicon,
  },
  props: {
    pubkey: {
      type: String,
      required: true
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      avatarFetchFailed: false,
    }
  },
  setup() {
    return {
      nostr: useNostrStore()
    }
  },
  computed: {
    hasAvatar() {
      return !!this.avatarUrl
    },
    avatarUrl() {
      return this.nostr.getProfile(this.pubkey)?.picture
    }
  },
  methods: {
    onFetchFailed() {
      this.avatarFetchFailed = true
    }
  },
}
</script>

<template>
  <span v-if="verified" class="nip05-badge">
    <q-icon name="verified" :size="size" color="primary">
      <q-tooltip>{{ $t("NIP05 verified") }}</q-tooltip>
    </q-icon>
    <span class="nip05-badge-text">{{ nip05 }}</span>
  </span>
</template>

<script>
import { useNostrStore } from 'src/nostr/NostrStore'

export default {
  name: 'Nip05Badge',
  props: {
    pubkey: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: '14px',
    },
  },
  setup() {
    return {
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      verified: false,
    }
  },
  computed: {
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    nip05() {
      if (!this.profile?.nip05.url) return
      return this.profile.nip05.url
        .split('@')
        .filter(
          (part) =>
            part !== '_' &&
            part?.toLowerCase() !== this.profile.name?.toLowerCase()
        )
        .join('@')
    },
  },
  watch: {
    async profile() {
      this.verified = await this.profile?.isNip05Verified()
    },
  },
  async mounted() {
    this.verified = await this.profile?.isNip05Verified()
  },
}
</script>

<style lang="scss" scoped>
.nip05-badge {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  &-text {
    margin-left: 2px;
  }
}
</style>

<template>
  <q-page class="profile">
    <PageHeader back-button />

    <div class="profile-header">
      <UserAvatar :pubkey="pubkey" />
      <div class="profile-header-content">
        <UserName :pubkey="pubkey" two-line show-verified />
      </div>
    </div>

    <div class="profile-tabs">
      <q-tabs
        v-model="activeTab"
        dense
        outline
        align="left"
        :breakpoint="0"
      >
        <q-tab name="posts" label="Posts" />
        <q-tab name="follows" label="Follows" />
        <q-tab name="followers" label="Followers" />
        <q-tab name="relays" label="Relays" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="activeTab" class="profile-tab-panels" animated>
      <q-tab-panel name="posts" class="no-padding">
        <ListPost
          v-for="note in posts"
          :key="note.id"
          :note="note"
          actions
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import PageHeader from 'components/PageHeader.vue'
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import ListPost from 'components/Post/ListPost.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex} from 'src/utils/utils'

export default defineComponent({
  name: 'Profile',
  components: {
    PageHeader,
    UserAvatar,
    UserName,
    ListPost,
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      activeTab: 'posts',
    }
  },
  computed: {
    pubkey() {
      return bech32ToHex(this.$route.params.pubkey)
    },
    posts() {
      return this.nostr.getNotesByAuthor(this.pubkey)
    },
  },
  mounted() {
    this.nostr.fetchNotesByAuthor(this.pubkey)
  }
})
</script>

<style lang="scss" scoped>
.profile {
  &-header {
    display: flex;
  }
  &-tab-panels {
    background-color: unset;
  }
}
</style>

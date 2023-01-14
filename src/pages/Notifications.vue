<template>
  <PageHeader back-button />
  <div class="notifications">
    <template v-for="(note, i) in notifications">
      <ListPost v-if="defer(i)" :key="note.id" :note="note" class="list-post" clickable />
    </template>
    <ListPlaceholder :count="notifications?.length" :loading="loading" />
  </div>
</template>

<script>
import PageHeader from 'components/PageHeader.vue'
import ListPost from 'components/Post/ListPost.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
import {NoteOrder} from 'src/nostr/store/NoteStore'
import Defer from 'src/utils/Defer'
import {useSettingsStore} from 'stores/Settings'
import ListPlaceholder from 'components/ListPlaceholder.vue'

export default {
  name: 'Notifications',
  components: {ListPlaceholder, ListPost, PageHeader},
  mixins: [Defer()],
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
      settings: useSettingsStore(),
    }
  },
  data() {
    return {
      notifications: [],
      loading: true,
    }
  },
  methods: {
  },
  mounted() {
    const read = []
    const unread = []
    this.nostr.streamNotifications(
      this.app.myPubkey,
      event => {
        if (event.createdAt >= this.settings.notificationsLastRead) {
          unread.push(event)
        } else {
          read.push(event)
        }
      },
  () => {
        unread.sort(NoteOrder.CREATION_DATE_DESC)
        this.notifications = unread
        this.loading = false
      }
    )
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.notifications {
  //border-top: $border-dark;
  .list-post:first-child {
    border-top: $border-dark;
  }
}
</style>

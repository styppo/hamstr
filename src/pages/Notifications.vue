<template>
  <PageHeader back-button />
  <div class="notifications">
    <template v-for="(note, i) in notifications">
      <ListPost v-if="defer(i)" :key="note.id" :note="note" class="list-post" clickable actions />
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
      stream: null,
      loading: true,
    }
  },
  methods: {
  },
  mounted() {
    this.stream = this.nostr.streamNotifications(this.app.myPubkey)
    this.stream.on('init', events => {
      events.sort(NoteOrder.CREATION_DATE_DESC)
      this.notifications = events
      this.loading = false
    })
    this.stream.on('update', event => this.notifications.unshift(event))
  },
  unmounted() {
    if (this.stream) this.stream.close()
  },
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

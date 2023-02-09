<template>
  <PageHeader back-button>
    <template #addon>
      <div class="under-construction">
        <q-icon name="warning" size="xs"/> Under construction
      </div>
    </template>
  </PageHeader>

  <div class="notifications">
    <template v-for="(note, i) in posts">
      <ListPost
        v-if="defer(i)"
        :key="note.id"
        :note="note"
        class="list-post"
        clickable
        actions
      />
    </template>
    <ListPlaceholder :count="notifications?.length" :loading="loading" />
  </div>
</template>

<script>
import PageHeader from 'components/PageHeader.vue'
import ListPost from 'components/Post/ListPost.vue'
import ListPlaceholder from 'components/ListPlaceholder.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useSettingsStore} from 'stores/Settings'
import Defer from 'src/utils/Defer'

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
      stream: null,
      loading: true,
    }
  },
  computed: {
    notifications() {
      return this.nostr.getNotifications(this.app.myPubkey)
    },
    posts() {
      return this.notifications?.filter(note => note && !note.isReaction())
    }
  },
  methods: {
  },
  mounted() {
    // this.stream = this.nostr.streamNotifications(this.app.myPubkey)
    // this.stream.on('init', events => {
    //   events.sort(NoteOrder.CREATION_DATE_DESC)
    //   this.notifications = this.nostr.getNotifications(this.app.myPubkey)
    //   this.loading = false
    // })
    //this.stream.on('update', event => this.notifications.unshift(event))
    this.loading = false
  },
  unmounted() {
    if (this.stream) this.stream.close()
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.under-construction {
  color: $color-light-gray;
  font-size: .95rem;
  i {
    vertical-align: top;
  }
}
</style>

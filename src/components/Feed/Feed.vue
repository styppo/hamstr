<template>
  <div class="feed">
    <div class="load-more-container" :class="{'more-available': numUnreads}">
      <AsyncLoadButton
        v-if="numUnreads"
        :load-fn="loadNewer"
        :label="`Load ${numUnreads} unread`"
      />
    </div>

    <Thread v-for="thread in visible" :key="thread[0].id" :thread="thread" class="full-width" />

    <ListPlaceholder :count="visible.length" :loading="loading" />

    <AsyncLoadButton
      v-if="visible.length"
      :load-fn="loadOlder"
      autoload
    />
  </div>
</template>

<script>
import AsyncLoadButton from 'components/AsyncLoadButton.vue'
import Thread from 'components/Post/Thread.vue'
import ListPlaceholder from 'components/ListPlaceholder.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import DateUtils from 'src/utils/DateUtils'
import Bots from 'src/utils/bots'

const feedOrder = (a, b) => b[0].createdAt - a[0].createdAt

const MAX_ITEMS_VISIBLE = 25

export default {
  name: 'Feed',
  components: {
    ListPlaceholder,
    Thread,
    AsyncLoadButton
  },
  props: {
    feed: {
      type: Object,
      required: true,
    }
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      visible: [],
      newer: [],
      older: [],
      stream: null,
      loading: true,
      recentlyLoaded: true,
    }
  },
  computed: {
    numUnreads() {
      if (this.recentlyLoaded) return 0
      return this.newer.length
    },
  },
  methods: {
    init() {
      const filters = typeof this.feed.filters === 'function'
        ? this.feed.filters()
        : this.feed.filters
      this.stream = this.nostr.stream(
        filters,
        {subId: `feed:${this.feed.name}`}
      )
      this.stream.on('init', notes => {
        const data = typeof this.feed.data === 'function'
          ? this.feed.data()
          : this.feed.data || []
        const items = notes
          .concat(data)
          .filter(note => this.filterNote(note, this.feed.hideBots))
          .map(note => [note]) // TODO Single element thread
        items.sort(feedOrder)
        this.visible = items.slice(0, MAX_ITEMS_VISIBLE)
        this.loading = false

        // Wait a bit before showing the first unreads
        setTimeout(() => this.recentlyLoaded = false, 5000)
      })
      this.stream.on('update', note => {
        if (this.filterNote(note, this.feed.hideBots)) {
          this.newer.push([note]) // TODO Single element thread
        }
      })
    },
    reload() {
      if (!this.stream) return
      this.loading = true
      this.stream.close()
      this.init()
    },
    loadNewer() {
      // TODO Deduplicate feed items
      this.newer.sort(feedOrder)
      const items = this.newer.concat(this.visible)
      if (items.length > MAX_ITEMS_VISIBLE) {
        const older = items.splice(MAX_ITEMS_VISIBLE)
        this.older = older.concat(this.older)
      }
      //items.sort(feedOrder)

      this.visible = items
      this.newer = []

      // Wait a bit before showing unreads again
      this.recentlyLoaded = true
      setTimeout(() => this.recentlyLoaded = false, 5000)

      return true
    },
    async loadOlder() {
      const feedFilters = typeof this.feed.filters === 'function'
        ? this.feed.filters()
        : this.feed.filters

      const until = this.visible[this.visible.length - 1]?.[0]?.createdAt || DateUtils.now()
      const filters = Object.assign({}, feedFilters, {until})

      if (this.older.length >= filters.limit) {
        const chunk = this.older.splice(0, filters.limit)
        this.visible = this.visible.concat(chunk)
        return chunk
      }

      // Remove any residual older items
      this.older = []

      const older = await this.nostr.fetch(filters, {subId: `feed:${this.feed.name}-older`})
      const items = older
        .filter(note => note.createdAt <= until)
        .filter(note => this.filterNote(note, this.feed.hideBots))
        .map(note => [note]) // TODO Single element thread
        .sort(feedOrder)

      // TODO Deduplicate feed items
      this.visible = this.visible.concat(items)

      return items
    },
    filterNote(note, hideBots) {
      if (note.isReaction()) return false
      if (note.isRepostOrTag()) return false
      if (hideBots && note.relatedPubkeys().some(Bots.isBot)) return false
      return true
    }
  },
  mounted() {
    this.init()
  },
  unmounted() {
    if (this.stream) this.stream.close()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.feed {
  .load-more-container {
    border-top: $border-dark;
    min-height: 6px;
    &.more-available {
      border-bottom: $border-dark;
    }
  }
  > .async-load-button:last-child {
    border-bottom: 0;
  }
}

@media screen and (max-width: $phone) {
  .feed {
    .load-more-container {
      border: 0;
      min-height: 0;
      &.more-available {
        border-top: $border-dark;
        border-bottom: $border-dark;
      }
    }
  }
}
</style>

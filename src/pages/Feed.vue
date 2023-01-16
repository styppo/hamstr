<template>
  <q-page>
    <PageHeader logo class="page-header">
      <template #addon>
        <div class="addon-menu">
          <div class="addon-menu-icon">
            <q-icon name="more_vert" size="sm" />
          </div>
          <q-menu target=".addon-menu-icon" anchor="top left" self="top right" class="addon-menu-popup">
            <div>
              <div
                v-for="feed in availableFeeds"
                :key="feed"
                @click="switchFeed(feed)"
                class="popup-header"
                v-close-popup>
                <p>{{ feed }}</p>
                <div v-if="feed === selectedFeed" class="more">
                  <BaseIcon icon="tick" />
                </div>
              </div>
            </div>
          </q-menu>
        </div>
      </template>
    </PageHeader>

    <div class="post-editor" v-if="app.isSignedIn">
      <PostEditor />
    </div>

    <div class="feed">
      <div class="load-more-container" :class="{'more-available': numUnreads}">
        <AsyncLoadButton
          v-if="numUnreads"
          :load-fn="loadUnreads"
          :label="`Load ${numUnreads} unreads`"
        />
      </div>

      <template v-for="(thread, i) in feedItems">
        <Thread v-if="defer(i)" :key="thread[0].id" :thread="thread" class="full-width" />
      </template>

      <ListPlaceholder :count="feedItems?.length" :loading="loading" />

      <AsyncLoadButton
        v-if="feedItems?.length"
        :load-fn="loadOlder"
        autoload
      />
    </div>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import PageHeader from 'components/PageHeader.vue'
import PostEditor from 'components/CreatePost/PostEditor.vue'
import Thread from 'components/Post/Thread.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import AsyncLoadButton from 'components/AsyncLoadButton.vue'
import ListPlaceholder from 'components/ListPlaceholder.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import Defer from 'src/utils/Defer'
import {EventKind} from 'src/nostr/model/Event'
import DateUtils from 'src/utils/DateUtils'

const Feeds = {
  global: {
    name: 'global',
    filters: {
      kinds: [EventKind.NOTE], // TODO Deletions
      limit: 20,
    },
  },
}

const feedOrder = (a, b) => b[0].createdAt - a[0].createdAt

export default defineComponent({
  name: 'Feed',
  components: {
    PageHeader,
    PostEditor,
    Thread,
    BaseIcon,
    AsyncLoadButton,
    ListPlaceholder,
  },
  mixins: [Defer(2000)],
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      feeds: {},
      availableFeeds: ['global'],
      selectedFeed: 'global',
      loading: true,
      recentlyLoaded: true,
    }
  },
  computed: {
    activeFeed() {
      return this.feeds[this.selectedFeed]
    },
    feedItems() {
      return this.activeFeed?.items
    },
    feedUnreads() {
      return this.activeFeed?.unreads
    },
    numUnreads() {
      if (this.recentlyLoaded) return 0
      return this.activeFeed?.unreads.length
    },
  },
  methods: {
    initFeed(feedId) {
      if (this.feeds[feedId]) return

      const filters = Feeds[feedId].filters
      const stream = this.nostr.stream(
        filters,
        {subId: `feed:${feedId}`}
      )
      stream.on('init', events => {
        const items = events.map(event => [event]) // TODO Single element thread
        items.sort(feedOrder)
        this.feeds[feedId].items = items.slice(0, filters.limit)
        this.loading = false

        // Wait a bit before showing the first unreads
        setTimeout(() => this.recentlyLoaded = false, 5000)
      })
      stream.on('update', event => {
        this.feeds[feedId].unreads.push([event]) // TODO Single element thread
      })

      this.feeds[feedId] = {
        items: [],
        unreads: [],
        stream,
      }
    },
    switchFeed(feedId) {
      this.initFeed(feedId)
      this.selectedFeed = feedId
    },
    loadUnreads() {
      // TODO Deduplicate feed items
      const items = this.feedUnreads.concat(this.feedItems)
      //items.sort(feedOrder)
      this.activeFeed.items = items
      this.activeFeed.unreads = []

      // Wait a bit before showing unreads again
      this.recentlyLoaded = true
      setTimeout(() => this.recentlyLoaded = false, 5000)

      return true
    },
    async loadOlder() {
      const until = this.feedItems[this.feedItems.length - 1]?.[0]?.createdAt || DateUtils.now()
      console.log('until', new Date(until * 1000))
      const filters = Object.assign({}, Feeds[this.selectedFeed].filters, {until})

      const older = await this.nostr.fetch(filters, {subId: `feed:${this.selectedFeed}-older`})
      const items = older.map(event => [event]).sort(feedOrder)

      console.log('got items', older)

      console.log('length before', this.activeFeed.items.length)
      // TODO Deduplicate feed items
      this.activeFeed.items = this.feedItems.concat(items)

      console.log('length after', this.activeFeed.items.length)

      return older
    },
  },
  mounted() {
    this.initFeed(this.selectedFeed)
  },
  unmounted() {
    for (const feed of Object.values(this.feeds)) {
      feed.stream.close()
    }
  }
})
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.feed {
  .load-more-container {
    border-top: $border-dark;
    border-bottom: $border-dark;
    min-height: 6px;
  }
  > .async-load-button:last-child {
    border-bottom: 0;
  }
}

.addon-menu {
  display: flex;
  flex-direction: row-reverse;
  &-icon {
    cursor: pointer;
  }
}

@media screen and (max-width: $phone) {
  .page-header {
    border-bottom: $border-dark;
  }
  .post-editor {
    display: none;
  }
  .feed {
    .load-more-container {
      border: 0;
      min-height: 0;
      &.more-available {
        border-bottom: $border-dark;
      }
    }
  }
}
</style>
<style lang="scss">
@import "assets/theme/colors.scss";

.addon-menu-popup {
  min-width: 150px;
  border-radius: 1rem;
  padding: 10px;
  background-color: $color-bg;
  box-shadow: $shadow-white;
  .popup-header {
    display: flex;
    width: 100%;
    padding: 8px;
    cursor: pointer;
    border-radius: .5rem;
    p {
      margin: 0;
      flex-grow: 1;
      font-size: 1.1em;
      font-weight: bold;
      text-transform: capitalize;
    }
    &:hover {
      background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
    }
    .more {
      width: 1.5rem;
      height: 1.5rem;
      svg {
        fill: $color-primary;
        width: 100%;
      }
    }
  }
}
</style>

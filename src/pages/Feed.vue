<template>
  <q-page>
    <div class="page-header-container">
      <PageHeader>
        <div class="addon-menu">
          <div class="addon-menu-icon">
            <q-icon name="more_vert" size="sm" />
          </div>
          <q-menu target=".addon-menu-icon" anchor="top left" self="top right" class="addon-menu-popup">
            <div>
              <div
                v-for="feed in availableFeeds"
                :key="feed.name"
                @click="switchFeed(feed)"
                class="popup-header"
                v-close-popup>
                <p>{{ feed.name }}</p>
                <div v-if="feed === selectedFeed" class="more">
                  <BaseIcon icon="tick" />
                </div>
              </div>
            </div>
          </q-menu>
        </div>
      </PageHeader>
    </div>

    <div class="post-editor" v-if="app.isSignedIn">
      <PostEditor />
    </div>

    <div class="feed">
      <div class="load-more-container" :class="{'more-available': /* FIXME */false}">
        <ButtonLoadMore
          v-if="numUnreads"
          :label="`Load ${numUnreads} unread`"
          @click="loadUnreads"
        />
      </div>

      <Thread v-for="thread in feedItems" :key="thread.id" :thread="thread" class="full-width" />

<!--      <ButtonLoadMore-->
<!--        :loading="loadingMore"-->
<!--        :label="items.length === feed[tab].length ? 'load another day' : 'load 100 more'"-->
<!--        @click="loadMore"-->
<!--      />-->
    </div>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import PageHeader from 'components/PageHeader.vue'
import PostEditor from 'components/CreatePost/PostEditor.vue'
import Thread from 'components/Post/Thread.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import ButtonLoadMore from 'components/ButtonLoadMore.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore, Feeds} from 'src/nostr/NostrStore'

const feedOrder = (a, b) => b[0].createdAt - a[0].createdAt

export default defineComponent({
  name: 'Feed',
  components: {
    PageHeader,
    PostEditor,
    Thread,
    BaseIcon,
    ButtonLoadMore,
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      availableFeeds: [Feeds.GLOBAL],
      selectedFeed: Feeds.GLOBAL,
      feeds: {},
      initialLoadComplete: false,
    }
  },
  computed: {
    activeFeed() {
      return this.feeds[this.selectedFeed.name]
    },
    feedItems() {
      return this.activeFeed?.items
    },
    feedUnreads() {
      return this.activeFeed?.unreads
    },
    numUnreads() {
      if (!this.initialLoadComplete) return 0
      return this.activeFeed?.unreads.length
    },
  },
  methods: {
    initFeed(feed) {
      if (this.feeds[feed.name]) return

      this.feeds[feed.name] = {
        items: [],
        unreads: [],
      }

      let initialFetchComplete = false
      let initialItems = []

      this.nostr.streamFeed(
        feed,
        event => {
          const target = initialFetchComplete
            ? this.feeds[feed.name].unreads
            : initialItems
          target.push([event]) // FIXME Single element thread
        },
        () => {
          initialItems.sort(feedOrder)
          this.feeds[feed.name].items = initialItems
          initialFetchComplete = true

          // Wait a bit before showing the first unreads
          setTimeout(() => this.initialLoadComplete = true, 5000)
        }
      )
    },
    switchFeed(feed) {
      this.initFeed(feed)
      this.selectedFeed = feed
    },
    loadUnreads() {
      const items = this.feedUnreads.concat(this.feedItems)
      items.sort(feedOrder)
      this.activeFeed.items = items
      this.activeFeed.unreads = []
    },
  },
  mounted() {
    this.initFeed(this.selectedFeed)
  }
})
</script>

<!--FIXME Should be scoped-->
<style lang="scss">
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.feed {
  .load-more-container {
    border-top: $border-dark;
    border-bottom: $border-dark;
    min-height: 6px;
  }
  > .load-more:last-child {
    border-bottom: 0;
  }
}

.addon-menu {
  display: flex;
  flex-direction: row-reverse;
  &-popup {
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
}

@media screen and (max-width: $phone) {
  .page-header-container {
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

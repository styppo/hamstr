<template>
  <q-page class="profile">
    <PageHeader back-button />

    <div class="profile-header">
      <UserAvatar :pubkey="pubkey" class="profile-header-avatar" />
      <div class="profile-header-content">
        <p class="username">
          <UserName :pubkey="pubkey" two-line header show-verified />
          <FollowButton :pubkey="pubkey" />
        </p>
        <p class="about">{{ profile?.about }}</p>
        <p class="followers">
          <a @click="goToFollowers('following')">
            <strong>{{ contacts?.length || 0 }}</strong> Following
          </a>
          <a @click="goToFollowers('followers')">
            <strong>{{ followers?.length ? `${followers?.length}+` : 0 }}</strong> Followers
          </a>
        </p>
        <p class="actions">
          <a @click="goToConversation">
            <BaseIcon icon="messages" />
            <q-tooltip>Send private message</q-tooltip>
          </a>
          <a>
            <q-icon name="bolt" size="sm" />
            <q-tooltip>Tip with Bitcoin Lightning</q-tooltip>
          </a>
        </p>
      </div>
    </div>

    <div class="profile-tabs">
      <q-tabs
        v-model="activeTab"
        outline
        align="justify"
        indicator-color="primary"
        :breakpoint="0"
      >
        <q-tab name="posts" label="Posts" />
        <q-tab name="replies" label="Replies" />
        <q-tab name="reactions" label="Reactions" />
        <q-tab name="relays" label="Relays" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="activeTab" class="profile-tab-panels" animated>
      <q-tab-panel name="posts" class="no-padding">
        <template v-for="(note, i) in posts">
          <ListPost
            v-if="defer(i)"
            :key="note.id"
            :note="note"
            clickable
            actions
          />
        </template>
        <AsyncLoadLink :load-fn="loadMorePosts" :has-items="!!posts?.length" />
      </q-tab-panel>
      <q-tab-panel name="replies" class="no-padding">
        <template v-for="(thread, i) in replies">
          <Thread
            v-if="defer(i)"
            :key="thread[1].id"
            :thread="thread"
          />
        </template>
        <AsyncLoadLink :load-fn="loadMorePosts" :has-items="!!replies?.length" />
      </q-tab-panel>
      <q-tab-panel name="reactions" class="no-padding">
        <template v-for="(thread, i) in reactions">
          <Thread
            v-if="defer(i)"
            :key="thread[1].id"
            :thread="thread"
          />
        </template>
        <AsyncLoadLink :load-fn="loadMoreReactions" :has-items="!!reactions?.length" />
      </q-tab-panel>
      <q-tab-panel name="relays" class="no-padding">
        <ListPlaceholder :count="0" />
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
import Thread from 'components/Post/Thread.vue'
import ListPlaceholder from 'components/ListPlaceholder.vue'
import FollowButton from 'components/User/FollowButton.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import AsyncLoadLink from 'components/AsyncLoadLink.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex, hexToBech32} from 'src/utils/utils'
import Defer from 'src/utils/Defer'
import {EventKind} from 'src/nostr/model/Event'
import DateUtils from 'src/utils/DateUtils'

export default defineComponent({
  name: 'Profile',
  components: {
    PageHeader,
    UserAvatar,
    UserName,
    BaseIcon,
    FollowButton,
    Thread,
    ListPlaceholder,
    ListPost,
    AsyncLoadLink,
  },
  mixins: [Defer()],
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      activeScreen: 'posts',
      activeTab: this.$route.params.tab || 'posts',
      loadingNotes: true,
      loadingReactions: true,
    }
  },
  computed: {
    pubkey() {
      return bech32ToHex(this.$route.params.pubkey)
    },
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    notes() {
      return this.nostr.getPostsByAuthor(this.pubkey)
    },
    posts() {
      return this.notes?.filter(note => !note.hasAncestor())
    },
    replies() {
      return this.notes?.filter(note => note.hasAncestor())
        .map(note => [this.nostr.getNote(note.ancestor()), note])
        .slice(0, 50)
    },
    reactions() {
      return this.nostr.getReactionsByAuthor(this.pubkey)
        .map(note => [this.nostr.getNote(note.ancestor()), note])
        .slice(0, 50)
    },
    relays() {
      // TODO
      return []
    },
    contacts() {
      return this.nostr.getContacts(this.pubkey)
    },
    followers() {
      return this.nostr.getFollowers(this.pubkey)
    },
  },
  methods: {
    loadMorePosts() {
      const oldest = this.notes?.[this.notes.length - 1]?.createdAt || DateUtils.now()
      return this.nostr.fetch({
        kinds: [EventKind.NOTE],
        authors: [this.pubkey],
        until: oldest,
        limit: 100,
      })
    },
    loadMoreReactions() {
      const oldest = this.reactions?.[this.reactions.length - 1]?.createdAt || DateUtils.now()
      return this.nostr.fetch({
        kinds: [EventKind.REACTION],
        authors: [this.pubkey],
        until: oldest,
        limit: 100,
      })
    },
    goToFollowers(tab = 'following') {
      this.$router.push({
        name: 'followers',
        params: {
          pubkey: hexToBech32(this.pubkey, 'npub'),
          tab,
        }
      })
    },
    goToConversation() {
      this.$router.push({
        name: 'conversation',
        params: {
          pubkey: hexToBech32(this.pubkey, 'npub'),
        }
      })
    },
  },
  watch: {
    activeTab() {
      this.$router.replace({
        params: {
          tab: this.activeTab
        }
      })
    },
  },
  mounted() {
    this.nostr.fetchPostsByAuthor(this.pubkey, 50)
      .then(() => this.loadingNotes = false)
    this.nostr.fetchReactionsByAuthor(this.pubkey, 50)
      .then(() => this.loadingReactions = false)
    this.nostr.fetchFollowers(this.pubkey, 1000)

    // FIXME
    this.stream = this.nostr.streamFullProfile(this.pubkey)
  },
  unmounted() {
    if (this.stream) this.nostr.cancelStream(this.stream)
  }
})
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.profile {
  &-header {
    display: flex;
    padding: 1rem;
    &-avatar {
      height: 128px;
      width: 128px;
      margin-right: 1rem;
    }
    &-content {
      flex-grow: 1;
      > p.username {
        display: flex;
        > span:first-child {
          flex-grow: 1;
        }
      }
      p:last-child {
        margin-bottom: 0;
      }
      .followers {
        a {
          cursor: pointer;
          color: $color-light-gray;
          &:hover, &:active {
            text-decoration: underline;
          }
          strong {
            color: #fff;
          }
        }
        a + a {
          margin-left: 1rem;
        }
      }
      .actions {
        display: flex;
        a {
          svg, i {
            width: 24px;
            height: 24px;
            color: $color-light-gray;
            fill: $color-light-gray;
            //fill: $color-fg;
            transition: 120ms ease;
          }
          &:hover svg, &:hover i {
            fill: $color-fg;
            color: $color-fg;
            //fill: $color-primary;
          }
        }
        a + a {
          margin-left: .5rem;
        }
      }
    }
  }
  &-tabs {
    border-bottom: $border-dark;
  }
  &-tab-panels {
    background-color: unset;
  }
}

@media screen and (max-width: $phone-lg) {
  .profile {
    &-header {
      display: flex;
      padding: 1rem;
      &-avatar {
        height: 96px;
        width: 96px;
      }
    }
  }
}
</style>

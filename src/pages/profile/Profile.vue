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
        <ListPlaceholder :count="posts?.length" :loading="loadingNotes" />
      </q-tab-panel>
      <q-tab-panel name="replies" class="no-padding">
        <template v-for="(thread, i) in replies">
          <Thread
            v-if="defer(i)"
            :key="thread[1].id"
            :thread="thread"
          />
        </template>
        <ListPlaceholder :count="replies?.length" :loading="loadingNotes" />
      </q-tab-panel>
      <q-tab-panel name="reactions" class="no-padding">
        <template v-for="(thread, i) in reactions">
          <Thread
            v-if="defer(i)"
            :key="thread[1].id"
            :thread="thread"
          />
        </template>
        <ListPlaceholder :count="reactions?.length" :loading="loadingReactions" />
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
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex, hexToBech32} from 'src/utils/utils'
import Defer from 'src/utils/Defer'

export default defineComponent({
  name: 'Profile',
  components: {
    FollowButton,
    ListPlaceholder,
    Thread,
    PageHeader,
    UserAvatar,
    UserName,
    ListPost,
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
      return this.nostr.getNotesByAuthor(this.pubkey)
    },
    posts() {
      return this.notes?.filter(note => !note.hasAncestor()).slice(0, 50)
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
    goToFollowers(tab = 'following') {
      this.$router.push({
        name: 'followers',
        params: {
          pubkey: hexToBech32(this.pubkey, 'npub'),
          tab,
        }
      })
    }
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
    this.nostr.fetchNotesByAuthor(this.pubkey, 50)
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

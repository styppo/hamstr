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
            <strong>{{ `${followers?.length}+` || 0 }}</strong> Followers
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
        <ListPost
          v-for="note in posts"
          :key="note.id"
          :note="note"
          clickable
          actions
        />
        <EmptyPlaceholder v-if="!posts?.length" />
      </q-tab-panel>
      <q-tab-panel name="replies" class="no-padding">
        <Thread
          v-for="thread in replies"
          :key="thread[1].id"
          :thread="thread"
        />
        <EmptyPlaceholder v-if="!replies?.length" />
      </q-tab-panel>
      <q-tab-panel name="reactions" class="no-padding">
        <Thread
          v-for="thread in reactions"
          :key="thread[1].id"
          :thread="thread"
        />
        <EmptyPlaceholder v-if="!reactions?.length" />
      </q-tab-panel>
      <q-tab-panel name="relays" class="no-padding">
        <EmptyPlaceholder />
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
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex, hexToBech32} from 'src/utils/utils'
import EmptyPlaceholder from 'components/EmptyPlaceholder.vue'
import FollowButton from 'components/User/FollowButton.vue'

export default defineComponent({
  name: 'Profile',
  components: {
    FollowButton,
    EmptyPlaceholder,
    Thread,
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
      activeScreen: 'posts',
      activeTab: 'posts',
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
      return this.notes.filter(note => !note.hasAncestor())
    },
    replies() {
      return this.notes.filter(note => note.hasAncestor())
        .map(note => [this.nostr.getNote(note.ancestor()), note])
    },
    reactions() {
      return this.nostr.getReactionsByAuthor(this.pubkey)
        .map(note => [this.nostr.getNote(note.ancestor()), note])
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
  mounted() {
    // FIXME
    this.nostr.fetchNotesByAuthor(this.pubkey, 50)
    this.nostr.fetchReactionsByAuthor(this.pubkey, 50)
    this.nostr.fetchFollowers(this.pubkey, 1000)
    this.stream = this.nostr.streamFullProfile(this.pubkey)
  },
  unmounted() {
    if (this.stream) this.nostr.cancelStream(this.stream)
  }
})
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

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
      .username {
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
</style>

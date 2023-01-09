<template>
  <q-page class="profile">
    <PageHeader back-button />

    <div class="profile-header">
      <UserAvatar :pubkey="pubkey" class="profile-header-avatar" />
      <div class="profile-header-content">
        <p class="username"><UserName :pubkey="pubkey" two-line show-verified /></p>
        <p class="about">{{ profile?.about }}</p>
        <p class="followers">
          <span>
            <strong>{{ contacts?.length || 0 }}</strong> Following
          </span>
          <span>
            <strong>{{ followers?.length || 0 }}</strong> Followers
          </span>
        </p>
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
        <q-tab name="replies" label="Replies" />
        <q-tab name="following" label="Following" />
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
          clickable
          actions
        />
      </q-tab-panel>
      <q-tab-panel name="replies" class="no-padding">
        <ListPost
          v-for="note in replies"
          :key="note.id"
          :note="note"
          clickable
          actions
        />
      </q-tab-panel>
      <q-tab-panel name="following" class="no-padding">
        <UserCard
          v-for="contact in contacts"
          :key="contact.pubkey"
          :pubkey="contact.pubkey"
          clickable
        />
      </q-tab-panel>
      <q-tab-panel name="followers" class="no-padding">
        <UserCard
          v-for="follower in followers"
          :key="follower"
          :pubkey="follower"
          clickable
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
import UserCard from 'components/User/UserCard.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex} from 'src/utils/utils'

export default defineComponent({
  name: 'Profile',
  components: {
    UserCard,
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
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    notes() {
      return this.nostr.getNotesByAuthor(this.pubkey)
    },
    posts() {
      return this.notes.filter(note => !note.isReply())
    },
    replies() {
      return this.notes.filter(note => note.isReply())
    },
    contacts() {
      return this.nostr.getContacts(this.pubkey)
    },
    followers() {
      return this.nostr.getFollowers(this.pubkey)
    },
  },
  mounted() {
    this.nostr.fetchNotesByAuthor(this.pubkey)
    this.nostr.fetchFollowers(this.pubkey)
  }
})
</script>

<style lang="scss" scoped>
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
      .followers {
        span + span {
          margin-left: 1rem;
        }
      }
    }
  }
  &-tab-panels {
    background-color: unset;
  }
}
</style>
<style lang="scss">
.profile-header-content .username {
  .name, .pubkey:first-child {
    font-size: 1.4rem;
  }
}
</style>

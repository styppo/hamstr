<template>
  <q-page class="followers">
    <PageHeader back-button>
      <UserName :pubkey="pubkey" two-line header />
    </PageHeader>

    <div class="profile-tabs">
      <q-tabs
        v-model="activeTab"
        outline
        align="justify"
        indicator-color="primary"
        :breakpoint="0"
      >
        <q-tab name="following" label="Following" />
        <q-tab name="followers" label="Followers" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="activeTab" class="profile-tab-panels" animated>
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
import UserCard from 'components/User/UserCard.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {bech32ToHex, hexToBech32} from 'src/utils/utils'
import UserName from 'components/User/UserName.vue'

export default defineComponent({
  name: 'Profile',
  components: {
    UserName,
    UserCard,
    PageHeader,
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      activeTab: this.$route.params.tab || 'following',
    }
  },
  computed: {
    pubkey() {
      return bech32ToHex(this.$route.params.pubkey)
    },
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    contacts() {
      return this.nostr.getContacts(this.pubkey)
    },
    followers() {
      return this.nostr.getFollowers(this.pubkey)
    },
  },
  methods: {
    hexToBech32,
  },
  mounted() {
    this.nostr.fetchFollowers(this.pubkey, 1000)
  },
  watch: {
    activeTab() {
      this.$router.replace({
        params: {
          tab: this.activeTab
        }
      })
    }
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
      .followers {
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
<style lang="scss">
.profile-tabs {
  .q-tab {
  }
}
.profile-header-content .username {
  .name, .pubkey:first-child {
    font-size: 1.4rem;
  }
}
</style>

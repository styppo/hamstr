<template>
  <div class="welcome" v-if="!app.isSignedIn">
    <div class="welcome-header">
      <h3>New to Nostr?</h3>
    </div>
    <div class="welcome-content">
      <button v-if="nip07available" class="btn btn-primary" @click.stop="signInNip07()">Log in with Extension</button>
      <button class="btn" :class="{'btn-primary': !nip07available}" @click.stop="signUp">
        Create Account
      </button>
      <button v-if="!nip07available" class="btn" @click.stop="signIn">Log in</button>
      <a v-else @click.stop="signIn">Log in with key</a>
    </div>
  </div>
</template>

<script>
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useSettingsStore} from 'stores/Settings'
import Nip07 from 'src/utils/Nip07'

export default {
  name: 'WelcomeBox',
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
      settings: useSettingsStore(),
    }
  },
  data() {
    return {
      nip07available: false,
    }
  },
  methods: {
    signUp() {
      this.app.signIn('sign-up')
    },
    signIn() {
      this.app.signIn('sign-in')
    },
    async signInNip07() {
      const pubkey = await Nip07.getPublicKey()

      const account = {
        pubkey,
        useExtension: true,
      }
      this.settings.addAccount(account)
      this.app.switchAccount(pubkey)

      this.nostr.getProfile(pubkey)
    },
  },
  mounted() {
    this.nip07available = Nip07.isAvailable()
    setTimeout(() => this.nip07available = Nip07.isAvailable(), 300)
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.welcome {
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  margin-bottom: 1rem;
  &-header {
    padding: 1rem;
    h3 {
      margin: 0;
      font-size: 1.4rem;
      color: #fff;
    }
  }
  &-content {
    border-top: $border-dark;
    padding: 1rem;
    text-align: center;
    button {
      width: 100%;
      padding: .5rem;
      &:first-child {
        margin-bottom: 1rem;
      }
    }
    a {
      display: inline-block;
      margin-top: 1rem;
      cursor: pointer;
      color: $color-primary;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

</style>

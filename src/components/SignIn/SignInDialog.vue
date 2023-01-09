<template>
  <q-dialog v-model="app.signInDialog.open" @before-show="updateFragment" @hide="onClose">
    <div class="sign-in-dialog">
      <q-btn
        v-if="showClose"
        icon="close"
        size="md"
        class="icon"
        flat
        round
        v-close-popup
      />
      <q-btn
        v-if="showBack"
        @click="fragment = 'welcome'"
        icon="arrow_back"
        size="md"
        class="icon"
        flat
        round
      />

      <div class="logo">
        <UserAvatar v-if="pubkey" :pubkey="pubkey" />
        <Logo v-else />
      </div>

      <div v-if="fragment === 'welcome'" class="welcome">
        <p class="prompt">
          {{ prompt }}
        </p>
        <button v-if="nip07available" class="btn btn-primary" @click.stop="signInNip07()">Log in with Extension</button>
        <button class="btn" :class="{'btn-primary': !nip07available}" @click.stop="fragment = 'sign-up'">
          Create Account
        </button>
        <button v-if="!nip07available" class="btn" @click.stop="fragment = 'sign-in'">Log in</button>
        <a v-else @click.stop="fragment = 'sign-in'">Log in with key</a>
      </div>

      <SignUpForm v-if="fragment === 'sign-up'" @complete="onComplete" />
      <SignInForm v-if="fragment === 'sign-in'" @complete="onComplete"/>

      <div v-if="fragment === 'complete'" class="complete">
        <h3>Signed in as</h3>
        <p>
          <UserName v-if="pubkey" :pubkey="pubkey" two-line />
        </p>
        <button class="btn btn-primary" v-close-popup>Let's go</button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import Logo from 'components/Logo.vue'
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import SignUpForm from 'components/SignIn/SignUpForm.vue'
import SignInForm from 'components/SignIn/SignInForm.vue'
import {useAppStore} from 'stores/App'
import {useSettingsStore} from 'stores/Settings'
import Nip07 from 'src/utils/Nip07'

export default {
  name: 'SignInDialog',
  components: {
    UserName,
    Logo,
    UserAvatar,
    SignInForm,
    SignUpForm
  },
  props: {
    prompt: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {
      app: useAppStore(),
      settings: useSettingsStore(),
    }
  },
  data() {
    return {
      fragment: 'welcome',
      backAllowed: true,
      pubkey: null,
    }
  },
  computed: {
    showClose() {
      return this.fragment === 'welcome'
        || (this.fragment !== 'complete' && !this.backAllowed)
    },
    showBack() {
      return this.fragment !== 'complete' && !this.showClose
    },
    nip07available() {
      return Nip07.isAvailable()
    }
  },
  methods: {
    onClose() {
      if (typeof this.app.signInDialog.callback === 'function') {
        this.app.signInDialog.callback.call(null, this.pubkey || false)
      }
      this.fragment = 'welcome'
      this.pubkey = null
    },
    onComplete({pubkey}) {
      this.pubkey = pubkey
      this.fragment = 'complete'
    },
    updateFragment() {
      this.fragment = this.app.signInDialog.fragment || 'welcome'
      this.backAllowed = this.fragment === 'welcome'
    },
    async signInNip07() {
      const pubkey = await Nip07.getPublicKey()

      const account = {
        pubkey,
        useExtension: true,
      }
      this.settings.addAccount(account)
      this.settings.switchAccount(pubkey)

      this.onComplete({pubkey})
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.sign-in-dialog {
  position: relative;
  background-color: $color-bg;
  padding: 1rem;
  min-width: 440px;
  text-align: center;
  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    top: .5rem;
    left: .5rem;
    fill: #fff;
  }
  .logo {
    width: 128px;
    height: 128px;
    margin: auto;
    > * {
      width: inherit;
      height: inherit;
    }
  }
  .welcome {
    button {
      width: 100%;
      margin-top: 20px;
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
  .complete {
    button {
      margin: 2rem auto auto;
    }
  }
}

@media screen and (max-width: $phone-lg) {
  .sign-in-dialog {
    min-width: unset;
    width: 100%;
  }
}

</style>

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
        <button class="btn btn-primary" @click.stop="fragment = 'sign-up'">Create Account</button>
        <button class="btn" @click.stop="fragment = 'sign-in'">Log in</button>
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
    }
  },
  data() {
    return {
      fragment: 'welcome',
      pubkey: null,
      backAllowed: true,
    }
  },
  computed: {
    showClose() {
      return this.fragment === 'welcome'
        || (this.fragment !== 'complete' && !this.backAllowed)
    },
    showBack() {
      return this.fragment !== 'complete' && !this.showClose
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
    }
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

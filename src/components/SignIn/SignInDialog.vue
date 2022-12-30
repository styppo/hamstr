<template>
  <q-dialog v-model="$store.state.signInDialogOpen" @hide="onClose">
    <div class="sign-in-dialog">
      <q-btn v-if="fragment === 'welcome'" icon="close" size="md" flat round class="icon" v-close-popup />
      <q-btn v-else-if="fragment !== 'complete'" icon="arrow_back" size="md" flat round class="icon" @click="fragment = 'welcome'" />

      <div class="logo">
        <BaseUserAvatar v-if="pubkey" :pubkey="pubkey" />
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
          <BaseUserName v-if="pubkey" :pubkey="pubkey" wrap />
        </p>
        <button class="btn btn-primary" v-close-popup>Let's go</button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import Logo from 'components/Logo.vue'
import BaseUserAvatar from 'components/BaseUserAvatar.vue'
import BaseUserName from 'components/BaseUserName.vue'
import SignUpForm from 'components/SignIn/SignUpForm.vue'
import SignInForm from 'components/SignIn/SignInForm.vue'

export default {
  name: 'SignInDialog',
  components: {
    BaseUserName,
    Logo,
    BaseUserAvatar,
    SignInForm,
    SignUpForm
  },
  props: {
    prompt: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fragment: 'welcome',
      pubkey: null,
    }
  },
  methods: {
    onClose() {
      this.fragment = 'welcome'

      if (this.pubkey) {
        if (typeof this.$store.state.signInSuccess === 'function') {
          this.$store.state.signInSuccess.call(null, this.pubkey)
        }
      } else {
        if (typeof this.$store.state.signInFailure === 'function') {
          this.$store.state.signInFailure.call(null)
        }
      }

      this.pubkey = null
      this.$store.commit('dismissSignInDialog')
    },
    onComplete({pubkey}) {
      this.$store.dispatch('useProfile', {pubkey})
      this.pubkey = pubkey
      this.fragment = 'complete'
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

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
</style>

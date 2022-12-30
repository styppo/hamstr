<template>
  <q-dialog v-model="$store.state.signInDialogOpen" @close="onClose">
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
      console.log('onClose')

      this.fragment = 'welcome'

      if (this.pubkey) {
        if (this.$store.state.signInSuccess) {
          this.$store.state.signInSuccess(this.pubkey)
        }
      } else {
        if (this.$store.state.signInFailure) {
          this.$store.state.signInFailure()
        }
      }

      this.pubkey = null

      this.$store.state.signInSuccess = null
      this.$store.state.signInFailure = null
    },
    onComplete({pubkey}) {
      this.$store.dispatch('useProfile', {pubkey})
      this.pubkey = pubkey
      this.fragment = 'complete'
    },
  },
}
</script>

<style lang="scss">
@import "assets/theme/colors.scss";

.sign-in-dialog {
  position: relative;
  background-color: $color-bg;
  padding: 2rem;
  min-width: 440px;
  text-align: center;
  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 1rem;
    left: 1rem;
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

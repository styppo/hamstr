<template>
  <div class="sign-up">
    <h3>Create Account</h3>
    <q-form @submit.stop="signUp">
      <label for="username">What's your name?</label>
      <input v-model="username" ref="input" id="username" autocomplete="false" />
      <button type="submit" class="btn btn-primary" :disabled="!validUsername">Create</button>
    </q-form>
  </div>
</template>

<script>
import {generatePrivateKey, getPublicKey} from 'nostr-tools'

export default {
  name: 'SignUpForm',
  emits: ['complete'],
  data() {
    return {
      username: null,
    }
  },
  computed: {
    validUsername() {
      return this.username && this.username.length > 0
    },
  },
  methods: {
    signUp() {
      if (!this.validUsername) return

      const priv = generatePrivateKey()
      const pub = getPublicKey(priv)
      const keys = {pub, priv}

      this.$store.dispatch('initKeys', keys)
      this.$store.dispatch('launch')

      const account = {secret: priv}
      this.$store.commit('addOrUpdateAccount', {
        pubkey: pub,
        account
      })

      this.$store.dispatch('setMetadata', {name: this.username})

      this.$emit('complete', {pubkey: pub, name: this.username})
    }
  },
  mounted() {
    this.$refs.input.focus()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.sign-up {
  margin: auto;
  label {
    display: block;
  }
  input {
    color: #fff;
    height: 50px;
    width: 100%;
    padding: 12px 20px;
    border-radius: 999px;
    margin: 1rem auto;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
    border: 1px solid rgba($color: $color-dark-gray, $alpha: 0);
    transition: border 150ms ease;
    &:focus {
      border: 1px solid rgba($color: $color-primary, $alpha: 1);
      outline: none;
    }
  }
  button {
    margin: auto;
  }
}
</style>

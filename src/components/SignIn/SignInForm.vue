<template>
  <div class="sign-in">
    <h3>Log in</h3>
    <q-form @submit.stop="signIn">
      <label for="private-key">Paste your private key</label>
      <input
        ref="input"
        v-model="privateKey"
        id="private-key"
        placeholder="nsec..."
        maxlength="64"
        :class="{
          valid: validKey,
          invalid: invalidKey,
        }"
      />
      <button type="submit" class="btn btn-primary" :disabled="!validKey">Log in</button>
    </q-form>
  </div>
</template>

<script>
import helpers from 'src/utils/mixin'
import {getPublicKey} from 'nostr-tools'

export default {
  name: 'SignInForm',
  mixins: [helpers],
  emits: ['complete'],
  data() {
    return {
      privateKey: null,
    }
  },
  computed: {
    validKey() {
      return this.isValidKey(this.privateKey)
    },
    invalidKey() {
      return this.privateKey
        && this.privateKey.length >= 63
        && !this.isValidKey(this.privateKey)
    }
  },
  methods: {
    isValidKey(str) {
      return this.isBech32Key(str)
    },
    signIn() {
      if (!this.validKey) return

      const priv = this.bech32ToHex(this.privateKey)
      const pub = getPublicKey(priv)

      const keys = {priv, pub}
      this.$store.dispatch('initKeys', keys)
      this.$store.dispatch('launch')

      const account = {secret: priv}
      this.$store.commit('addOrUpdateAccount', {
        pubkey: pub,
        account
      })

      this.$emit('complete', {pubkey: pub})
    },
  },
  mounted() {
    this.$refs.input.focus()
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.sign-in {
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
    &.valid {
      border-color: #44a644;
      color: #44a644;
    }
    &.invalid {
      border-color: #d41b1b;
      color: #d41b1b;
    }
  }
  button {
    margin: auto;
  }
}
</style>

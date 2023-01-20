<template>
  <div class="sign-in">
    <h3>{{ header }}</h3>
    <q-form @submit.stop="signIn">
      <label for="private-key">{{ prompt }}</label>
      <input
        ref="input"
        v-model="key"
        :placeholder="placeholder"
        maxlength="63"
        :class="{
          valid: validKey,
          invalid: invalidKey,
        }"
      />
      <button type="submit" class="btn btn-primary" :disabled="!validKey">{{ buttonLabel }}</button>
    </q-form>
  </div>
</template>

<script>
import {decode as bech32decode} from 'bech32-buffer'
import {bech32prefix, bech32ToHex} from 'src/utils/utils'
import {useSettingsStore} from 'stores/Settings'

export default {
  name: 'SignInForm',
  emits: ['complete'],
  props: {
    privateKeyOnly: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      key: null,
    }
  },
  computed: {
    header() {
      // TODO i18n
      return this.privateKeyOnly
        ? 'Private key needed'
        : 'Log in'
    },
    prompt() {
      // TODO i18n
      return this.privateKeyOnly
        ? 'Paste your private key to continue'
        : 'Paste your public or private key'
    },
    placeholder() {
      // TODO i18n
      return this.privateKeyOnly
        ? 'nsec…'
        : 'npub… / nsec…'
    },
    buttonLabel() {
      // TODO i18n
      return this.privateKeyOnly
        ? 'Continue'
        : 'Log in'
    },
    validKey() {
      return this.isValidKey(this.key)
    },
    invalidKey() {
      return this.key
        && this.key.length >= 63
        && !this.isValidKey(this.key)
    }
  },
  methods: {
    isValidKey(str) {
      if (!str) return false
      try {
        const {data, prefix} = bech32decode(str.toLowerCase())
        return data.byteLength === 32 && ((prefix === 'npub' && !this.privateKeyOnly) || prefix === 'nsec')
      } catch (e) {
        return false
      }
    },
    signIn() {
      if (!this.validKey) return

      let opts
      if (bech32prefix(this.key) === 'npub') {
        opts = {pubkey: bech32ToHex(this.key)}
      } else {
        opts = {privkey: bech32ToHex(this.key)}
      }

      const settings = useSettingsStore()
      const account = settings.addAccount(opts)
      settings.switchAccount(account.pubkey)

      this.$emit('complete', {pubkey: account.pubkey})
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

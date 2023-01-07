<template>
  <div
    class="searchbox"
    :class="{focused: isFocused}"
  >
    <div class="searchbox-wrapper">
      <div class="searchbox-icon">
        <BaseIcon icon="search" />
      </div>
      <div class="searchbox-input">
        <form @submit="searchProfile">
          <input
            type="text"
            placeholder="Search profiles"
            v-model="query"
            @focus="toggleFocus"
            @blur="toggleFocus"
          >
        </form>
      </div>
    </div>
  </div>

  <div v-if="domainMode">
    <div class="flex row justify-between no-wrap">
      <h2 class="text-h6 text-bold q-my-none"> {{ domain }} {{ $t('users') }}</h2>
      <q-btn icon="close" @click.stop="domainMode = false" />
    </div>
    <div v-if="domainDefaultPubkey">
      <h2 class="text-caption text-bold q-my-none"> {{ $t('nip05Maintainer') }} </h2>
      <BaseUserCard :pubkey="domainDefaultPubkey"/>
    </div>
    <q-list class="q-pt-xs q-pl-sm" style="overflow-y: auto; max-height: 40vh;">
      <div v-for="user in domainUsers" :key="user.pubkey">
        <BaseUserCard :pubkey="user.pubkey" />
      </div>
    </q-list>
    <q-separator color='accent' />
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import {Notify} from 'quasar'
import {searchDomain, queryName} from 'nostr-tools/nip05'
import helpersMixin from 'src/utils/mixin'

export default {
  name: 'SearchBox',
  components: {
    BaseIcon,
  },
  mixins: [helpersMixin],
  data() {
    return {
      isFocused: false,
      query: '',
      searching: false,
      domainMode: false,
      domainNames: {},
      profilesUsed: new Set(),
    }
  },
  computed: {
    validSearch() {
      if (this.query === '') return true
      if (this.query.match(/^[a-f0-9A-F]{64}$/)) return true
      if (this.isBech32Key(this.query) && this.bech32ToHex(this.query).match(/^[a-f0-9A-F]{64}$/)) return true
      if (this.query.match(/^([a-z0-9A-Z-_.\u00C0-\u1FFF\u2800-\uFFFD]*@)?[a-z0-9A-Z-_]+[.]{1}[a-z0-9A-Z-_.]+$/)) return true
      return false
    },
    domainDefaultPubkey() {
      return this.domainNames._
    },
    domainUsers() {
      let users = Object.keys(this.domainNames).filter((name) => name !== '_').map((name) => { return { 'name': name, 'pubkey': this.domainNames[name] } })
      return users
    },
    domain() {
      let [name, domain] = this.query.split('@')
      return domain || name
    }
  },
  methods: {
    toggleFocus() {
      this.isFocused = !this.isFocused
    },
    async searchProfile(e) {
      e.preventDefault()

      if (!this.validSearch) {
        Notify.create({
          message: 'Invalid format! Please enter full public key or NIP05 identifier',
          color: 'negative'
        })
        return
      }

      this.searching = true
      this.query = this.query.trim().toLowerCase()

      if (this.query.match(/^[a-f0-9]{64}$/)) {
        this.toProfile(this.query)
        this.query = ''
        this.searching = false
        return
      }

      if (this.isBech32Key(this.query) && this.bech32ToHex(this.query).match(/^[a-f0-9A-F]{64}$/)) {
        this.toProfile(this.bech32ToHex(this.query))
        this.query = ''
        this.searching = false
        return
      }

      if (this.query.match(/^([a-z0-9-_.\u00C0-\u1FFF\u2800-\uFFFD]*@)?[a-z0-9-_.]+[.]{1}[a-z0-9-_.]+$/)) {
        // if (!this.query.match(/^[a-z0-9-_.\u00C0-\u1FFF\u2800-\uFFFD]?@/)) {
        if (this.query.match(/^@/) || !this.query.match(/@/)) {
          //   this.query = '_' + this.query
          // else if (!this.query.match(/@/)) this.query = '_@' + this.query
          this.domainNames = await searchDomain(this.domain)
          // this.domainUsers
          if (this.domainUsers.length || this.domainDefaultPubkey) {
            if (this.domainDefaultPubkey) this.useProfile(this.domainDefaultPubkey)
            if (this.domainUsers.length) this.domainUsers.forEach((user) => this.useProfile(user.pubkey))
            this.searching = false
            this.domainMode = true
            return
          }
        }
        // }
        console.log('this.domainUsers', this.domainUsers)
        let pubkey = await queryName(this.query)
        console.log('queryName returned: ', pubkey)
        if (pubkey) {
          this.toProfile(pubkey)
          this.query = ''
          this.searching = false
          return
        }
      }
      this.searching = false
      Notify.create({
        message: 'No user found! Please enter full public key or NIP05 identifier and double check search string',
        color: 'negative'
      })
    },
    useProfile(pubkey) {
      if (this.profilesUsed.has(pubkey)) return

      this.profilesUsed.add(pubkey)
      this.$store.dispatch('useProfile', {pubkey})
    },
  },
}
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';

.searchbox {
  height: 50px;
  padding: 12px 1rem;
  border-radius: 999px;
  margin: 1rem 0;
  background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
  border: 1px solid rgba($color: $color-dark-gray, $alpha: 0);
  transition: border 150ms ease;
  &-wrapper {
    display: flex;
    align-items: center;
  }
  &-icon {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 1rem;
    svg {
      width: 100%;
      height: 100%;
      fill: #fff;
      transition: border 150ms ease;
    }
  }
  &-input {
    flex-grow: 1;
    input {
      background: transparent;
      color: #fff;
      border: none;
      width: 100%;
      display: block;
      &:focus {
        border: none;
        outline: none;
      }
    }
  }
  &.focused {
    border: 1px solid rgba($color: $color-primary, $alpha: 1);
    svg {
      fill: $color-primary;
    }
  }
}
</style>

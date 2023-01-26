<template>
  <div class="relative-position">
    <div class="searchbox" :class="{focused}">
      <div class="searchbox-wrapper">
        <div class="searchbox-icon">
          <BaseIcon icon="search" />
        </div>
        <div class="searchbox-input">
          <q-form @submit.stop="search">
            <input
              v-model="query"
              ref="input"
              type="text"
              placeholder="Search profiles"
              @focus="toggleFocus"
              @blur="toggleFocus"
              @keyup="search"
              @keyup.esc="$refs.input.blur()"
            >
          </q-form>
        </div>
      </div>
    </div>
    <Transition name="fade">
      <div v-if="focused" class="searchbox-results">
        <div v-if="!results.length" class="query-example">
          <b>npub…</b> or <b>[user]@domain</b> or <b>name</b>
        </div>
        <UserCard
          v-for="pubkey in results"
          :key="pubkey"
          :pubkey="pubkey"
          class="searchbox-results-item"
          clickable
          @mousedown="goToProfile(pubkey)"
        />
      </div>
    </Transition>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import SearchProvider from 'src/nostr/SearchProvider'
import UserCard from 'components/User/UserCard.vue'
import routerMixin from 'src/router/mixin'

export default {
  name: 'SearchBox',
  mixins: [routerMixin],
  components: {
    UserCard,
    BaseIcon,
  },
  setup() {
    return {
      provider: new SearchProvider(),
    }
  },
  data() {
    return {
      focused: false,
      query: '',
      results: [],
    }
  },
  methods: {
    toggleFocus() {
      this.focused = !this.focused
    },
    async search() {
      if (this.query) {
        this.results = (await this.provider.queryProfiles(this.query)).slice(0, 200)
      } else {
        this.results = []
      }
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
  &-results {
    position: absolute;
    width: calc(100% + 1rem);
    min-height: 48px;
    max-height: 70vh;
    overflow: hidden;
    background-color: $color-bg;
    border-radius: .5rem;
    z-index: 600;
    margin-top: -.75rem;
    box-shadow: $shadow-white;
    overflow-y: scroll;
    scrollbar-color: transparent transparent;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    &::-webkit-scrollbar-thumb { /* Foreground */
      background: $color-dark-gray;
    }
    &::-webkit-scrollbar-track { /* Background */
      background: transparent;
    }
    &-item {
      transition: 120ms ease;
      margin: 0 !important;
      padding: 1rem;
      &:hover {
        background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
      }
    }
    .query-example {
      color: $color-light-gray;
      font-size: .95rem;
      padding: 1rem;
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

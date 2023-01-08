<template>
  <div class="searchbox" :class="{focused}">
    <div class="searchbox-wrapper">
      <div class="searchbox-icon">
        <BaseIcon icon="search" />
      </div>
      <div class="searchbox-input">
        <form @submit="search">
          <input
            type="text"
            placeholder="Search"
            v-model="query"
            @focus="toggleFocus"
            @blur="toggleFocus"
          >
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import {Notify} from 'quasar'

export default {
  name: 'SearchBox',
  components: {
    BaseIcon,
  },
  data() {
    return {
      focused: false,
      query: '',
    }
  },
  computed: {
  },
  methods: {
    toggleFocus() {
      this.focused = !this.focused
    },
    async search(e) {
      e.preventDefault()

      Notify.create({
        message: 'Coming soon',
        color: 'info',
      })
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

<template>
  <div class="page-header">
    <div
      v-if="backButton"
      class="back-button"
      @click="$router.go(-1)"
    >
      <base-icon icon="back" />
    </div>
    <h2>{{ title || titleFromRoute() || 'Home' }}</h2>
    <span v-if="subline">{{ subline }}</span>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BaseIcon from 'components/BaseIcon/index.vue'

export default defineComponent({
  name: 'PageHeader',
  components: {
    BaseIcon
  },
  props: {
    title: {
      type: String,
      default: undefined,
    },
    subline: {
      type: String,
      default: undefined,
    },
    backButton: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    titleFromRoute() {
      const route = this.$route.name?.toLowerCase()
      return route.charAt(0).toUpperCase() + route.substring(1)
    }
  }
})
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';

.page-header {
  //border-bottom: $border-dark;
  padding: .5rem 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  h2 {
    font-size: 1.5em;
    font-weight: bold;
    line-height: unset;
    letter-spacing: unset;
    margin: .5rem 0;
  }
  .back-button {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 20px;
    padding: 6px;
    border-radius: 999px;
    cursor: pointer;
    &:hover {
      background-color: rgba($color: $color-blue, $alpha: 0.3);
    }
    svg {
      width: 100%;
      height: 100%;
      transform: translateX(-3px);
      fill: $color-blue;
    }
  }
  .profile-info {
    h2 {
      margin: 0 0 3px;
    }
    span {
      color: $color-dark-gray;
      font-size: 12px;
    }
  }
}
</style>

<template>
  <div class="page-header" :class="{ dense }">
    <div v-if="backButton" class="back-button" @click="$router.go(-1)">
      <base-icon icon="back" />
    </div>
    <div :class="{ 'profile-info': !!subline }">
      <slot>
        <h2>{{ $t(title || titleFromRoute() || "Home") }}</h2>
        <span v-if="subline">{{ subline }}</span>
      </slot>
    </div>
    <div class="addon">
      <slot name="addon" />
    </div>
    <router-link v-if="logo" class="logo" to="/">
      <Logo />
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import Logo from 'components/Logo.vue'

export default defineComponent({
  name: 'PageHeader',
  components: {
    Logo,
    BaseIcon,
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
    },
    logo: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    titleFromRoute() {
      const route = this.$route.name?.toLowerCase()
      return route?.charAt(0).toUpperCase() + route?.substring(1)
    },
  },
})
</script>

<style lang="scss">
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.page-header {
  padding: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: $color-bg;
  z-index: 500;
  h2 {
    line-height: 50px;
    margin: 0;
  }
  .back-button {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 1rem;
    padding: 6px;
    border-radius: 999px;
    cursor: pointer;
    &:hover {
      background-color: rgba($color: $color-primary, $alpha: 0.3);
    }
    svg {
      width: 100%;
      height: 100%;
      transform: translateX(-3px);
      fill: $color-primary;
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
  .logo {
    display: none;
  }
  .addon {
    flex-grow: 1;
    text-align: right;
  }
  &.dense {
    .back-button {
      margin-right: 0.5rem;
    }
  }
}

@media screen and (max-width: $phone) {
  .page-header {
    padding: 0.4rem 1rem;
    .logo {
      display: block;
      position: absolute;
      height: 36px;
      width: 36px;
      left: calc(50% - 18px);
      svg {
        height: inherit;
        width: inherit;
      }
    }
  }
}
</style>

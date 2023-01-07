<template>
  <component
    :is="enabled ? 'router-link' : 'div'"
    :to="enabled ? to : ''"
    @click="enabled && $emit('click')"
  >
    <div class="menu-item">
      <div class="menu-item-logo">
        <base-icon
          :icon="icon"
          :icon-color="iconColor"
        />
      </div>
      <div class="menu-item-content">
        <slot />
      </div>
    </div>
  </component>
</template>

<script>
import BaseIcon from 'components/BaseIcon'

export default {
  name: 'MenuItem',
  components: {
    BaseIcon
  },
  props: {
    icon: {
      type: String,
      default: 'more'
    },
    iconColor: {
      type: String,
      default: '#fff'
    },
    to: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click'],
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

a {
  display: block;
  text-decoration: none;
}

.menu-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 12px;
  border-radius: 999px;
  transition: 120ms ease-in-out;
  color: #fff;
  &-logo {
    width: 2rem;
    height: 2rem;
    svg {
      transition: 20ms ease-in-out fill;
      fill: #fff;
    }
  }
  &-content {
    transition: 20ms ease-in-out color;
    margin: 0 20px;
    color: inherit;
    font-size: 20px;
    font-weight: bold;
  }
  &:hover {
    background-color: rgba($color: $color-primary, $alpha: 0.2);
    & {
      color: $color-primary;
    }
    svg {
      fill: $color-primary;
    }
  }
}

.router-link-active, .router-link-exact-active {
  .menu-item {
    &-logo {
      svg {
        fill: $color-primary;
      }
    }
    &-content {
      color: $color-primary;
    }
  }
}

@media screen and (max-width: $tablet) and (min-width: $phone) {
  .menu-item {
    &-content {
      visibility: hidden;
      width: 0;
      margin: 0;
    }
  }
}

</style>

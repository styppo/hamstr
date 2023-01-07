<template>
  <div class="more-menu">
    <div
      v-for="item in moreMenuItems"
      :key="item.name"
      class="more-menu-item"
    >
      <div class="icon">
        <base-icon :icon="item.icon" />
      </div>
      <div class="content">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import { MORE_MENU_ITEMS } from 'components/MainMenu/constants.js'

export default {
  name: 'MoreMenu',
  components: {
    BaseIcon
  },
  data: function() {
    return {
      moreMenuItems: MORE_MENU_ITEMS
    }
  }
}
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';

.more-menu {
  position: absolute;
  bottom: 54px;
  left: 0;
  width: 260px;
  padding: 10px;
  background-color: $color-bg;
  box-shadow: $shadow-white;
  border-radius: 5px;
  &-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 10px 5px;
    & + & {
      margin-top: 10px;
    }
    .icon {
      width: 1.5rem;
      svg {
        fill: #fff;
      }
    }
    .content {
      font-weight: bold;
      color: #fff;
      margin-left: 10px;
    }
    &:hover {
      background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    }
  }
}
</style>

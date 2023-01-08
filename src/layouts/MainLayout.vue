<template>
  <q-layout>
    <div class="layout" @click="mobileMenuOpen = false">
      <div class="layout-menu">
        <div class="layout-menu-fixed" :class="{active: mobileMenuOpen}">
          <MainMenu @click.stop @mobile-menu-close="mobileMenuOpen = false" hide-items-requiring-sign-in />
        </div>
      </div>

      <div class="layout-flow">
        <q-page-container ref="pageContainer">
          <router-view v-slot="{ Component }">
            <keep-alive :include="cachedPages">
              <component :is="Component" :key="$route.path" />
            </keep-alive>
          </router-view>
        </q-page-container>
      </div>

      <div class="layout-sidebar">
        <div class="layout-sidebar-fixed">
          <SearchBox />
          <WelcomeBox />
          <Trends />
        </div>
      </div>

      <div
        class="mobile-menu-toggler"
        @click.stop="mobileMenuOpen = !mobileMenuOpen"
      >
        <BaseIcon icon="hamburger" />
      </div>
      <div v-if="mobileMenuOpen" class="mobile-menu-backdrop fixed-full" v-close-popup></div>
    </div>

    <SignInDialog />
    <CreatePostDialog />
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {useQuasar} from 'quasar'
import MainMenu from 'components/MainMenu/MainMenu.vue'
import SearchBox from 'components/SearchBox/SearchBox.vue'
import WelcomeBox from 'components/Sidebar/WelcomeBox.vue'
import Trends from 'components/Trends/index.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import SignInDialog from 'components/SignIn/SignInDialog.vue'
import CreatePostDialog from 'components/CreatePost/CreatePostDialog.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    MainMenu,
    SearchBox,
    WelcomeBox,
    Trends,
    BaseIcon,
    SignInDialog,
    CreatePostDialog,
  },
  data() {
    return {
      cachedPages: ['Feed', 'Notifications', 'Messages', 'Inbox', 'Settings'],
      mobileMenuOpen: false,
    }
  },
  setup() {
    const $q = useQuasar()
    $q.screen.setSizes({
      // FIXME Needs to be in sync with assets/variables.scss
      sm: 414,
      md: 755,
      lg: 1113,
      xl: 1310,
    })
    return $q
  },

})

</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.layout {
  min-height: 100%;
  max-width: 1290px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  &-menu {
    width: 100%;
    max-width: 300px;
    &-fixed {
      position: sticky;
      top: 0;
      width: 100%;
      max-width: inherit;
      z-index: 1000;
    }
  }
  &-flow {
    border-right: $border-dark;
    border-left: $border-dark;
    width: 100%;
    min-width: 660px;
    max-width: 660px;
    min-height: 100vh;
  }
  &-sidebar {
    width: 100%;
    min-width: 330px;
    margin: 0 1rem;
    &-fixed {
      position: fixed;
      width: 330px;
      max-width: inherit;
    }
  }
  .mobile-menu-toggler {
    display: none;
  }
}

@media screen and (max-width: $tablet-sm) {
  .layout-sidebar {
    display: none;
  }
}

@media screen and (max-width: $phone-lg) {
  .layout-menu {
    max-width: 80px;
  }
  .layout-flow {
    min-width: unset;
  }
}

@media screen and (max-width: $phone) {
  .layout {
    &-menu {
      max-width: 300px;
      width: unset;
      &-fixed {
        position: fixed;
        background-color: $color-bg;
        transform: translateX(-100%);
        transition: 200ms ease;
        z-index: 1000;
        &.active {
          transform: translateX(0%);
          box-shadow: $shadow-white;
        }
      }
    }
    &-flow {
      border: 0;
    }
    &-sidebar {
      display: none;
      max-width: unset;
      &-fixed {
        display: none;
      }
    }
    .mobile-menu-toggler {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      width: 3rem;
      height: 3rem;
      padding: 6px 8px 8px;
      border-radius: 999px;
      background-color: $color-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 555;
      svg {
        width: 100%;
        height: 100%;
        fill: #fff;
      }
    }
    .mobile-menu-backdrop {
      z-index: 750;
      pointer-events: all;
      outline: 0;
      background: rgba(0, 0, 0, 0.4);
    }
  }
}
</style>

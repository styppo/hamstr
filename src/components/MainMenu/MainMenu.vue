<template>
  <menu>
    <div class="menu-nav">
      <div class="menu-logo">
        <router-link to="/">
          <Logo />
        </router-link>
      </div>
      <div v-for="(route, i) in items" :key="i">
        <MenuItem
          v-if="!hideItemsRequiringSignIn || !route.signInRequired || $store.getters.isSignedIn"
          :icon="route.name.toLowerCase()"
          :to="route.path"
          :enabled="route.enabled !== false"
        >
          {{ route.name }}
        </MenuItem>
      </div>
      <MenuItem
        v-if="!hideItemsRequiringSignIn || $store.getters.isSignedIn"
        icon="profile"
        :to="`/profile/${$store.getters.myPubkey}`"
        :enabled="$store.getters.isSignedIn"
      >
        Profile
      </MenuItem>
      <MenuItem
        icon="settings"
        to="/settings"
      >
        Settings
      </MenuItem>

      <!--      <menu-item-->
      <!--        icon="more"-->
      <!--        @click="toggleMenu"-->
      <!--      >-->
      <!--        More-->
      <!--        <more-menu v-if="isMenuOpened" />-->
      <!--      </menu-item>-->

      <div
        v-if="!hideItemsRequiringSignIn || $store.getters.isSignedIn"
        class="menu-post-button"
        @click="$store.dispatch('createPost')"
      >
        <span class="label">Post</span>
        <BaseIcon class="icon" icon="pen" />
      </div>
    </div>

    <ProfilePopup v-if="$store.getters.isSignedIn" />

    <div
      class="mobile-close-menu-button"
      @click="$emit('mobile-menu-close')"
    >
      <div class="icon">
        <BaseIcon icon="left" />
      </div>
      <span>Close</span>
    </div>
  </menu>
</template>

<script>
import MenuItem from 'components/MainMenu/MenuItem.vue'
import { MENU_ITEMS } from 'components/MainMenu/constants.js'
import BaseIcon from 'components/BaseIcon'
import ProfilePopup from 'components/MainMenu/ProfilePopup'
import Logo from 'components/Logo.vue'
// import MoreMenu from 'components/MainMenu/MoreMenu'
// import { mapGetters } from 'vuex'

export default {
  name: 'MainMenu',
  components: {
    Logo,
    MenuItem,
    BaseIcon,
    //MoreMenu,
    ProfilePopup
  },
  props: {
    hideItemsRequiringSignIn: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['mobile-menu-close'],
  data: function() {
    return {
      items: MENU_ITEMS,
      isMenuOpened: false
    }
  },
  computed: {
    me() {
      return {
        id: '808750ab31182b452c7447e9d1903f82b991c5d5f1f32199cf648b932615ee8f',
        username: 'foobar',
        profile: {
          pic: '',
          nickname: 'foobar',
          name: 'foobar'
        }
      }
    }
    // ...mapGetters({
    //   me: 'getMe'
    // })
  },
  methods: {
    toggleMenu: function() {
      this.isMenuOpened = !this.isMenuOpened
    }
  }
}
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';
@import 'assets/variables.scss';

menu {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding-inline-start: 0;
  .menu {
    &-nav {
      position: relative;
      padding: 0 1rem;
    }
    height: 100%;
    &-logo {
      margin: 1rem 0;
      svg, img {
        display: block;
        width: 50px;
        height: 50px;
      }
      svg {
        circle {
          fill: transparent;
          transition: fill 200ms ease-in-out;
        }
        &:hover circle {
          fill: rgba($color: $color-primary, $alpha: 0.3);
        }
      }
    }
    &-post-button {
      width: 90%;
      text-align: center;
      padding: 1rem 0;
      cursor: pointer;
      background-color: $color-primary;
      color: #fff;
      font-weight: bold;
      font-size: 1.2rem;
      border-radius: 999px;
      margin-top: 20px;
      .icon {
        display: none;
      }
    }
  }
  .mobile-close-menu-button {
    display: none;
  }
}

@media screen and (max-width: $tablet) and (min-width: $phone) {
  menu {
    align-items: flex-end;
    .menu-post-button {
      width: fit-content;
      padding: 1rem;
      .label {
        display: none;
      }
      .icon {
        display: block;
        width: 24px;
        height: 24px;
        fill: #fff;
      }
    }
  }
}

@media screen and (max-width: $phone) {
  menu {
    .mobile-close-menu-button {
      position: absolute;
      right: 1rem;
      top: 1rem;
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 999px;
      background-color: $color-primary;
      cursor: pointer;
      .icon {
        width: 1.2rem;
        height: 1.2rem;
        svg {
          fill: #fff;
          width: 100%;
          height: 100%;
        }
      }
      span {
        color: #fff;
        font-weight: bold;
        margin: 0 4px;
        line-height: 16px;
      }
    }
  }
}
</style>

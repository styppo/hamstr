<template>
  <menu>
    <div class="menu-nav">
      <div class="menu-logo">
        <router-link to="/">
          <Logo />
        </router-link>
      </div>
      <menu-item
        v-for="(route, i) in items"
        :key="i"
        :icon="route.name.toLowerCase()"
        :to="route.path"
        :required="route.req"
      >
        {{ route.name }}
      </menu-item>
      <menu-item
        icon="profile"
        :to="`/profile/${me.id}`"
        required
      >
        Profile
      </menu-item>
      <menu-item
        icon="settings"
        to="/settings"
        required
      >
        Settings
      </menu-item>

      <!--      <menu-item-->
      <!--        icon="more"-->
      <!--        @click="toggleMenu"-->
      <!--      >-->
      <!--        More-->
      <!--        <more-menu v-if="isMenuOpened" />-->
      <!--      </menu-item>-->

      <div
        class="menu-post-button"
        @click="$store.commit('toggleTweetButton')"
      >
        Post
      </div>
    </div>
    <profile-popup />
    <div
      class="mobile-close-menu-button"
      @click="$store.commit('setMobileMenuState', false)"
    >
      <div class="icon">
        <base-icon icon="left" />
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
import Logo from 'components/MainMenu/Logo'
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
  .menu {
    &-nav {
      position: relative;
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
      width: 80%;
      text-align: center;
      padding: 1rem 0;
      cursor: pointer;
      background-color: $color-primary;
      color: #fff;
      font-weight: bold;
      font-size: 1.2rem;
      border-radius: 999px;
      margin-top: 20px;
    }
  }
  .mobile-close-menu-button {
    display: none;
  }
}

@media screen and (max-width: $phone) {
  menu {
    .mobile-close-menu-button {
      position: absolute;
      right: 10px;
      top: 10px;
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 999px;
      background-color: $color-primary;
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
        margin-left: 8px;
      }
    }
  }
}
</style>

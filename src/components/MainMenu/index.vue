<template>
  <menu>
    <div class="menu-nav">
      <div class="menu-logo">
        <router-link to="/">
<!--          <base-icon icon="twitter" />-->
          <img src="icons/hamstr_3-64x64.png" />
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
import MenuItem from 'components/MainMenu/Item'
import { MENU_ITEMS } from 'components/MainMenu/constants.js'
import BaseIcon from 'components/BaseIcon'
import ProfilePopup from 'components/MainMenu/ProfilePopup'
// import MoreMenu from 'components/MainMenu/MoreMenu'
// import { mapGetters } from 'vuex'

export default {
  name: 'MainMenu',
  components: {
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
  .menu {
    &-nav {
      position: relative;
    }
    height: 100%;
    &-logo {
      width: 50px;
      height: 50px;
      padding: 10px;
      border-radius: 999px;
      transition: 200ms ease-in-out;
      svg, img {
        display: block;
        width: 100%;
        fill: #fff;
      }
      &:hover {
        background-color: rgba($color: $color-blue, $alpha: 0.2);
        svg{
          fill: #fff;
        }
      }
    }
    &-post-button {
      width: 80%;
      text-align: center;
      padding: 1rem 0;
      cursor: pointer;
      background-color: $color-blue;
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
      background-color: $color-blue;
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

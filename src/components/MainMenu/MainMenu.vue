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
          v-if="!hideItemsRequiringSignIn || !route.signInRequired || app.isSignedIn"
          :icon="route.name.toLowerCase()"
          :to="route.path"
          :enabled="route.enabled !== false"
          @click="$emit('mobile-menu-close')"
        >
          {{ route.name }}
        </MenuItem>
      </div>
      <MenuItem
        v-if="!hideItemsRequiringSignIn || app.isSignedIn"
        icon="profile"
        :to="`/profile/${app.myPubkey}`"
        :enabled="app.isSignedIn"
        @click="$emit('mobile-menu-close')"
      >
        Profile
      </MenuItem>
      <MenuItem
        icon="settings"
        to="/settings"
        @click="$emit('mobile-menu-close')"
      >
        Settings
      </MenuItem>

      <div
        v-if="!hideItemsRequiringSignIn || app.isSignedIn"
        class="menu-post-button"
        @click="createPost"
      >
        <span class="label">Post</span>
        <BaseIcon class="icon" icon="pen" />
      </div>
    </div>

    <div style="position: sticky; bottom: 0">
      <ProfilePopup v-if="app.isSignedIn" />
      <div v-else class="sign-in" @click="signIn">
        <q-icon class="icon" name="login" size="sm" />
        <div class="label">Log in</div>
      </div>
    </div>

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
import BaseIcon from 'components/BaseIcon'
import ProfilePopup from 'components/MainMenu/ProfilePopup'
import Logo from 'components/Logo.vue'
import {useAppStore} from 'stores/App'
import {MENU_ITEMS} from 'components/MainMenu/constants.js'

export default {
  name: 'MainMenu',
  components: {
    Logo,
    MenuItem,
    BaseIcon,
    ProfilePopup
  },
  props: {
    hideItemsRequiringSignIn: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['mobile-menu-close'],
  data() {
    return {
      items: MENU_ITEMS,
    }
  },
  setup() {
    return {
      app: useAppStore(),
    }
  },
  methods: {
    createPost() {
      this.$emit('mobile-menu-close')
      this.app.createPost()
    },
    signIn() {
      this.$emit('mobile-menu-close')
      this.app.signIn()
    }
  }
}
</script>

<style lang="scss">
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

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
    height: 100%;
    &-nav {
      position: relative;
      padding: 0 1rem;
    }
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
  .sign-in {
    display: flex;
    align-items: center;
    margin: 0 1rem 1rem;
    padding: 1rem;
    cursor: pointer;
    border-radius: 999px;
    transition: 120ms ease-in-out;
    &:hover {
      background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
    }
    .icon {
      padding: 2px;
    }
    .label {
      margin-left: 20px;
      font-weight: bold;
      font-size: 1.2em;
    }
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
    .sign-in {
      .label {
        display: none;
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

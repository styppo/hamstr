<template>
  <div class="menu-profile-wrapper">
    <div class="menu-profile">
      <div class="menu-profile-pic">
        <UserAvatar :pubkey="pubkey" :clickable="false" />
      </div>
      <div class="menu-profile-items">
        <div class="profile-info">
          <p>
            <UserName :pubkey="pubkey" two-line />
          </p>
        </div>
        <div class="more">
          <BaseIcon icon="more" />
        </div>
      </div>
    </div>
    <q-menu :offset="[0, 20]" target=".menu-profile" class="menu-profile-popup" >
      <div>
        <div v-for="(_, pk) in settings.accounts" :key="pk" class="popup-header" @click="settings.switchAccount(pk)" v-close-popup>
          <div class="sidebar-profile-pic">
            <UserAvatar :pubkey="pk" :clickable="false"/>
          </div>
          <div class="menu-profile-items">
            <div class="profile-info">
              <p>
                <UserName :pubkey="pk" :clickable="false" two-line />
              </p>
            </div>
            <div class="more" v-if="pk === pubkey">
              <BaseIcon icon="tick" />
            </div>
          </div>
        </div>
        <hr class="popup-spacing">
        <div class="popup-body">
          <div class="popup-body-item" @click="app.signIn()" v-close-popup>
            <p>Add an account</p>
          </div>
          <hr class="popup-spacing">
          <div
            class="popup-body-item"
            @click="$refs.logout.show()"
            v-close-popup
          >
            <p>Logout from <span><UserName :pubkey="pubkey" /></span></p>
          </div>
        </div>
      </div>
    </q-menu>
  </div>
  <LogoutDialog :pubkey="pubkey" ref="logout" />
</template>

<script>
import BaseIcon from 'components/BaseIcon/index.vue'
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import LogoutDialog from 'components/User/LogoutDialog.vue'
import {useAppStore} from 'stores/App'
import {useSettingsStore} from 'stores/Settings'

export default {
  name: 'ProfilePopup',
  components: {
    LogoutDialog,
    UserName,
    UserAvatar,
    BaseIcon
  },
  setup() {
    return {
      app: useAppStore(),
      settings: useSettingsStore(),
    }
  },
  computed: {
    pubkey() {
      return this.app.myPubkey
    },
    accounts() {
      return this.settings.accounts
    }
  },
}
</script>

<style lang="scss">
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.menu-profile {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  margin-right: 1rem;
  padding: .5rem 1rem;
  cursor: pointer;
  border-radius: 999px;
  transition: 120ms ease-in-out;
  &:hover {
    background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
  }
  &-wrapper {
    position: relative;
  }
  &-pic {
    padding: 2px;
    img {
      border-radius: 999px;
      width: 100%;
    }
  }
  &-items {
    margin-left: 12px;
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: space-between;
    .profile-info {
      user-select: none;
      p {
        margin: 0;
        & + p {
          margin-top: 5px;
        }
        color: #fff;
        &.nickname {
          color: $color-dark-gray;
        }
      }
    }
    .more {
      width: 2rem;
      height: 2rem;
      svg {
        width: 100%;
        fill: #fff;
        display: block;
      }
    }
  }
  &-popup {
    width: 300px;
    border-radius: 1rem;
    padding: 10px;
    background-color: $color-bg;
    box-shadow: $shadow-white;
    .popup-spacing {
      border: none;
      background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
      padding-top: 2px;
      margin: 3px;
    }
    .popup-header {
      display: flex;
      width: 100%;
      padding: 8px;
      cursor: pointer;
      &:hover {
        background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
      }
      .more {
        width: 1.5rem;
        height: 1.5rem;
        svg {
          fill: $color-primary;
          width: 100%;
        }
      }
    }
    .popup-body {
      &-item {
        color: #fff;
        font-size: 1.1rem;
        padding: 1rem;
        cursor: pointer;
        &:hover {
          background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
        }
        p {
          margin: 0;
          padding: 0;
        }
        span {
          color: $color-primary;
        }
      }
    }
  }
}

@media screen and (max-width: $tablet) and (min-width: $phone) {
  .menu-profile {
    padding: 4px;
    margin: auto;
    &-wrapper {
      padding: 0;
      margin: 0 10px 1rem auto;
    }
    > .menu-profile-items {
      display: none;
    }
  }
}


@media screen and (max-width: $phone) {
  .menu-profile {
    padding: .5rem;
    margin: 0 auto 1rem auto;
    &-wrapper {
      padding: 0 1rem;
    }
  }
}
</style>

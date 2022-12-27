<template>
  <div
    class="menu-profile-wrapper"
  >
    <div
      class="menu-profile"
      @click="toggleMenu"
    >
      <div class="menu-profile-pic">
        <BaseUserAvatar :pubkey="$store.state.keys.pub" />
      </div>
      <div class="menu-profile-items">
        <div class="profile-info">
          <p>{{ me.profile.name }}</p>
          <p class="nickname">
            {{ me.profile.nickname }}
          </p>
        </div>
        <div class="more">
          <base-icon icon="more" />
        </div>
      </div>
    </div>
    <div
      v-if="isMenuOpened"
      class="menu-profile-popup"
    >
      <div class="popup-header">
        <div class="sidebar-profile-pic">
          <img
            :src="me.profile.pic"
          >
        </div>
        <div class="menu-profile-items">
          <div class="profile-info">
            <p>{{ me.profile.name }}</p>
            <p class="nickname">
              {{ me.profile.nickname }}
            </p>
          </div>
          <div class="more">
            <base-icon icon="tick" />
          </div>
        </div>
      </div>
      <hr class="popup-spacing">
      <div class="popup-body">
        <div class="popup-body-item">
          <p>Add an existing account</p>
        </div>
        <hr class="popup-spacing">
        <div
          class="popup-body-item"
          @click="handleLogOut"
        >
          <p>Logout from <span>{{ me.profile.nickname }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import BaseIcon from '../BaseIcon/index'
import BaseUserAvatar from 'components/BaseUserAvatar.vue'

export default {
  name: 'ProfilePopup',
  components: {
    BaseUserAvatar,
    BaseIcon
  },
  data: function() {
    return {
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
    },
    handleLogOut() {
      this.$store.dispatch('setLogOut')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';

.menu-profile {
  display: flex;
  align-items: center;
  padding: 4px 1rem;
  margin-bottom: 1rem;
  margin-right: 1rem;
  cursor: pointer;
  border-radius: 999px;
  transition: 120ms ease-in-out;
  &-wrapper {
    position: relative;
  }
  &:hover {
    background-color: rgba($color: $color-primary, $alpha: 0.3);
  }
  &-pic {
    margin: 6px 0;
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
    position: absolute;
    z-index: 3;
    width: 105%;
    bottom: calc(100% + 20px);
    left: 0;
    border-radius: 1rem;
    padding: 10px;
    background-color: $color-bg;
    box-shadow: $shadow-white;
    & .popup-spacing {
      border: none;
      background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
      padding-top: 2px;
      margin: 3px;
    }
    .popup-header {
      display: flex;
      width: 100%;
      padding: 8px;
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
</style>

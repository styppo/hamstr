<template>
  <div class="menu-profile-wrapper">
    <div class="menu-profile">
      <div class="menu-profile-pic">
        <BaseUserAvatar :pubkey="pubkey" :clickable="false" />
      </div>
      <div class="menu-profile-items">
        <div class="profile-info">
          <p>
            <BaseUserName :pubkey="pubkey" :clickable="false" wrap />
          </p>
        </div>
        <div class="more">
          <base-icon icon="more" />
        </div>
      </div>
    </div>
    <q-menu :offset="[0, 20]" target=".menu-profile" class="menu-profile-popup" >
      <div>
        <div v-for="(_, pk) in $store.state.accounts" :key="pk" class="popup-header" @click="switchAccount(pk)">
          <div class="sidebar-profile-pic">
            <BaseUserAvatar :pubkey="pk" :clickable="false"/>
          </div>
          <div class="menu-profile-items">
            <div class="profile-info">
              <p>
                <BaseUserName :pubkey="pk" :clickable="false" wrap />
              </p>
            </div>
            <div class="more" v-if="pk === pubkey">
              <base-icon icon="tick" />
            </div>
          </div>
        </div>
        <hr class="popup-spacing">
        <div class="popup-body">
          <div class="popup-body-item" @click="$store.dispatch('signIn').catch(() => {})">
            <p>Add an account</p>
          </div>
          <hr class="popup-spacing">
          <div
            class="popup-body-item"
            @click="handleLogOut"
          >
            <p>Logout from <span>{{ $store.getters.displayName(pubkey) }}</span></p>
          </div>
        </div>
      </div>
    </q-menu>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import BaseIcon from '../BaseIcon/index'
import BaseUserAvatar from 'components/BaseUserAvatar.vue'
import BaseUserName from 'components/BaseUserName.vue'

export default {
  name: 'ProfilePopup',
  components: {
    BaseUserName,
    BaseUserAvatar,
    BaseIcon
  },
  computed: {
    pubkey() {
      return this.$store.getters.myPubkey
    }
  },
  methods: {
    switchAccount(pubkey) {
      const account = this.$store.state.accounts[pubkey]
      if (!account) return
      this.$store.commit('setKeys', {
        priv: account.secret,
        pub: pubkey
      })
      this.$store.dispatch('useProfile', {pubkey})
    },
    handleLogOut() {
      this.$store.dispatch('setLogOut')
      this.$router.push('/login')
    }
  }
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
  cursor: pointer !important;
  border-radius: 999px;
  transition: 120ms ease-in-out;
  &-wrapper {
    position: relative;
  }
  &:hover {
    background-color: rgba($color: $color-primary, $alpha: 0.3);
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

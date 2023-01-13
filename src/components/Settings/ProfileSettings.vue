<template>
<!--  <div class="profile-card">-->
<!--    <UserAvatar :pubkey="pubkey" class="profile-card-avatar" />-->
<!--    <div class="profile-card-content">-->
<!--      <p><UserName :pubkey="pubkey" two-line header show-verified /></p>-->
<!--      <p class="about">{{ about }}</p>-->
<!--    </div>-->
<!--  </div>-->
  <q-form class="profile-settings">
    <h3>Profile</h3>
    <div class="input">
      <q-input v-model="name" label="Name" maxlength="64" autogrow dense />
    </div>
    <div class="input">
      <q-input v-model="about" label="About" maxlength="150" autogrow dense />
    </div>
    <div class="input">
      <q-input v-model="picture" label="Picture URL" autogrow dense />
      <img :src="picture" class="picture-preview" loading="lazy" />
    </div>
    <div class="input">
      <q-input v-model="nip05" label="NIP05 Identifier" autogrow dense />
    </div>
    <div class="buttons">
      <q-btn type="submit" :disable="!changed" label="Save" flat rounded color="primary" />
      <q-btn label="Reset" :disable="!changed" flat rounded @click="updateData" />
<!--      <button type="submit" class="btn btn-sm btn-primary">Save</button>-->
<!--      <button class="btn btn-sm" @click="updateData">Reset</button>-->
    </div>
  </q-form>
</template>

<script>
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
// import UserAvatar from 'components/User/UserAvatar.vue'
// import UserName from 'components/User/UserName.vue'

export default {
  name: 'ProfileSettings',
  components: {},
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      name: '',
      about: '',
      picture: '',
      nip05: '',
    }
  },
  computed: {
    pubkey() {
      return this.app.myPubkey
    },
    profile() {
      return this.nostr.getProfile(this.pubkey)
    },
    changed() {
      return this.name !== (this.profile?.name || '')
        || this.about !== (this.profile?.about || '')
        || this.picture !== (this.profile?.picture || '')
        || this.nip05 !== (this.profile?.nip05?.url || '')
    },
  },
  methods: {
    updateData() {
      this.name = (this.profile?.name || '')
      this.about = (this.profile?.about || '')
      this.picture = (this.profile?.picture || '')
      this.nip05 = (this.profile?.nip05?.url || '')
    }
  },
  watch: {
    profile() {
      this.updateData()
    }
  },
  mounted() {
    this.updateData()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

//.profile-card {
//  display: flex;
//  border-radius: 1rem;
//  background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
//  padding: .5rem 1rem;
//  margin-bottom: 1rem;
//  &-avatar {
//    height: 128px;
//    width: 128px;
//    margin-right: 1rem;
//  }
//}

.profile-settings {
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  h3 {
    margin: 0;
    padding: 1rem;
    font-size: 1.4rem;
    border-bottom: $border-dark;
  }
  .input {
    position: relative;
    //padding: .5rem .5rem .5rem 1rem;
    transition: 200ms ease;
    //border-bottom: $border-dark;
    //input {
    //  color: #fff;
    //  font-weight: 500;
    //  width: 100%;
    //  outline: none;
    //  background-color: transparent;
    //  border: 0;
    //  padding: 0;
    //}
    &:hover, &.focused {
      background-color: rgba($color: $color-light-gray, $alpha: 0.2);
    }
    &:first-child {
      border-radius: 1rem 1rem 0 0;
    }
    .picture-preview {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
    }
  }
  .buttons {
    display: flex;
    flex-direction: row-reverse;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.15);
    border-radius: 0 0 1rem 1rem;
    padding: .35rem;
    button {
      letter-spacing: 1px;
      font-weight: 600;
    }
    button + button {
      margin-right: .5rem;
    }
  }
}
</style>
<style lang="scss">
@import "assets/theme/colors.scss";

.profile-settings .input {
  .q-field__label {
    color: $color-light-gray;
    margin: 0 1rem;
  }
  textarea {
    color: #fff;
    padding: 0 1rem;
    font-weight: 500;
  }
  .q-field__control:before {
    border-bottom: $border-dark;
  }
  .q-field__control-container {
    padding-top: 20px !important;
    padding-bottom: 6px;
  }
  .q-field--dense .q-field__label {
    top: 14px;
  }
}
</style>

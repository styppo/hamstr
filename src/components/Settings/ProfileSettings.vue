<template>
  <q-form v-if="app.isSignedIn" class="profile-settings" @submit.stop="updateProfile">
    <h3>Profile</h3>
    <div class="input">
      <q-input v-model="name" label="Name" maxlength="64" dense />
    </div>
    <div class="input">
      <q-input v-model="about" label="About" maxlength="150" autogrow dense />
    </div>
    <div class="input">
      <q-input v-model="picture" label="Picture URL" dense />
      <img v-if="picture" :src="picture" class="picture-preview" loading="lazy" />
    </div>
    <div class="input">
      <q-input v-model="nip05" label="NIP05 Identifier" dense />
      <q-icon v-if="verified" name="verified" class="nip05-verified" size="sm" />
    </div>
    <div class="buttons">
      <button type="submit" :disabled="!changed" class="btn btn-sm btn-primary">Save</button>
      <button class="btn btn-sm" :disabled="!changed" @click="setDataFromProfile">Reset</button>
    </div>
  </q-form>
</template>

<script>
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
import Nip05 from 'src/utils/Nip05'
import EventBuilder from 'src/nostr/EventBuilder'

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
      verified: false,
    }
  },
  computed: {
    pubkey() {
      return this.app.myPubkey
    },
    profile() {
      if (!this.pubkey) return
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
    setDataFromProfile() {
      this.name = (this.profile?.name || '')
      this.about = (this.profile?.about || '')
      this.picture = (this.profile?.picture || '')
      this.nip05 = (this.profile?.nip05.url || '')
      this.verified = this.profile?.nip05.verified
    },
    async updateProfile() {
      const metadata = {
        name: this.name || undefined,
        about: this.about || undefined,
        picture: this.picture || undefined,
        nip05: this.nip05 || undefined,
      }
      const event = EventBuilder.metadata(this.pubkey, metadata).build()
      if (!await this.app.signEvent(event)) return
      this.nostr.publish(event)
    },
  },
  watch: {
    profile() {
      this.setDataFromProfile()
    },
    async nip05() {
      this.verified = await Nip05.verify(this.pubkey, this.nip05)
    }
  },
  mounted() {
    this.setDataFromProfile()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.profile-settings {
  h3 {
    margin: 0;
    padding: 0 0 1rem;
    border-bottom: $border-dark;
  }
  .input {
    position: relative;
    transition: 200ms ease;
    .picture-preview {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
    }
    .nip05-verified {
      position: absolute;
      top: 12px;
      right: 12px;
      color: $color-primary;
    }
  }
  .buttons {
    display: flex;
    padding: 1rem 0;
    button {
      letter-spacing: 1px;
      font-weight: 600;
    }
    button + button {
      margin-left: .5rem;
    }
  }
}
</style>
<style lang="scss">
@import "assets/theme/colors.scss";

.profile-settings .input {
  .q-field__label {
    color: $color-light-gray;
    margin: 0 .5rem;
  }
  input, textarea {
    color: #fff;
    padding: 0 .5rem;
    font-weight: 500;
  }
  .q-field__control {
    min-height: 50px;
    &:before {
      border-bottom: $border-dark;
    }
  }
  .q-textarea .q-field__control-container {
    padding-top: 20px !important;
  }
  .q-input .q-field__control-container {
    padding-top: 12px !important;
  }
  .q-field--dense .q-field__label {
    top: 14px;
  }
}
</style>

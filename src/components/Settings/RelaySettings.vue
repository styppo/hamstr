<template>
  <div class="relay-settings">
    <h3>Relays</h3>
    <div v-for="relay in settings.relays" :key="relay" class="relay">
      <span class="relay-url">{{ relay }}</span>
<!--      <q-icon v-if="isConnected(relay)" icon="fiber_manual_record" size="sm" class="connected" />-->
      <q-btn icon="delete_outline" size="sm" class="btn-icon" flat round @click="removeRelay(relay)" />
    </div>
    <q-form class="add-relay" @submit.stop="addRelay">
      <q-input v-model="newRelayUrl" label="Add a relay" autogrow dense />
      <q-btn type="submit" icon="add_circle_outline" size="sm" flat round class="btn-icon" />
    </q-form>
  </div>
</template>

<script>
import {useSettingsStore} from 'stores/Settings'
import {Notify} from 'quasar'
// import {useNostrStore} from 'src/nostr/NostrStore'

export default {
  name: 'RelaySettings',
  setup() {
    return {
      settings: useSettingsStore(),
      // nostr: useNostrStore(),
    }
  },
  data() {
    return {
      newRelayUrl: '',
    }
  },
  methods: {
    addRelay() {
      let url
      try {
        url = new URL(this.newRelayUrl?.trim())
      } catch (e) {
        Notify.create({
          message: 'Invalid URL',
          color: 'negative'
        })
        return
      }
      if (url.protocol !== 'wss:') {
        Notify.create({
          message: 'Must be a wss:// URL',
          color: 'negative'
        })
        return
      }
      let href = url.href
      if (url.pathname === '/') {
        href = href.slice(0, -1)
      }
      if (this.settings.hasRelay(href)) {
        Notify.create({
          message: 'Relay already exists',
          color: 'negative'
        })
        return
      }
      this.settings.addRelay(href)
      this.newRelayUrl = ''
    },
    removeRelay(url) {
      this.settings.removeRelay(url)
    },
    // isConnected(url) {
    //   return this.nostr.client.isConnectedTo(url)
    // }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.relay-settings {
  h3 {
    margin: 0;
    padding: 0 0 1rem;
    border-bottom: $border-dark;
  }
  .relay {
    display: flex;
    align-items: center;
    padding: .5rem;
    border-bottom: $border-dark;
    transition: 200ms ease;
    &:hover {
      //background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    }
    &:last-child {
      border: 0;
    }
    &-url {
      flex-grow: 1;
      font-weight: 500;
    }
  }
  .add-relay {
    transition: 200ms ease;
    input {
      color: #fff;
      font-weight: 500;
      width: 100%;
      outline: none;
      background-color: transparent;
      border: 0;
      padding: 0;
    }
    &:hover {
      //background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    }
    .btn-icon {
      position: absolute;
      right: .5rem;
      top: 7px;
    }
  }
  .btn-icon {
    color: $color-primary;
  }
}
</style>
<style lang="scss">
@import "assets/theme/colors.scss";

.relay-settings .add-relay {
  .q-field__label {
    color: $color-light-gray;
    margin: 0 .5rem;
  }
  textarea {
    color: #fff;
    padding: 0 .5rem;
    font-weight: 500;
  }
  .q-field__control:before {
    border-bottom: $border-dark;
  }
  .q-field__control-container {
    padding-top: 17px !important;
    padding-bottom: 4px;
  }
  .q-field--dense .q-field__label {
    top: 12px;
  }
}
</style>

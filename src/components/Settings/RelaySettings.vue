<template>
  <div class="relay-settings">
    <h3>Relays</h3>
    <div v-for="relay in settings.relays" :key="relay" class="relay">
      <span class="relay-url">{{ relay }}</span>
<!--      <q-icon v-if="isConnected(relay)" icon="fiber_manual_record" size="sm" class="connected" />-->
      <q-btn icon="delete_outline" size="sm" class="btn-icon" flat round @click="removeRelay(relay)" />
    </div>
    <q-form class="add-relay" :class="{focused}" @submit.stop="addRelay">
      <input
        v-model="newRelayUrl"
        placeholder="Add a relay"
        @focus="focused = true"
        @blur="focused = false"
      />
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
      focused: false,
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
      console.log(url)
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
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  h3 {
    margin: 0;
    padding: 1rem;
    font-size: 1.4rem;
    border-bottom: $border-dark;
  }
  .relay {
    display: flex;
    align-items: center;
    padding: .5rem .5rem .5rem 1rem;
    border-bottom: $border-dark;
    transition: 200ms ease;
    &:hover {
      background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    }
    &:first-child {
      border-radius: 1rem 1rem 0 0;
    }
    &:last-child {
      border: 0;
      border-radius: 0 0 1rem 1rem;
    }
    &-url {
      flex-grow: 1;
      font-weight: 500;
    }
    .connected {
      color: $positive;
    }
  }
  .add-relay {
    display: flex;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    border-radius: 0 0 1rem 1rem;
    padding: .5rem .5rem .5rem 1rem;
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
    &:hover, &.focused {
      background-color: rgba($color: $color-light-gray, $alpha: 0.2);
    }
  }
  .btn-icon {
    color: $color-primary;
  }
}
</style>

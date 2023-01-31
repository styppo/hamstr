<template>
  <q-dialog v-model="dialogOpen">
    <div class="logout-dialog">
      <q-btn icon="close" size="md" class="icon" flat round v-close-popup />
      <h3>
        {{ $t("Do you really want to log out from") }}
        <UserName :pubkey="pubkey" />?
      </h3>
      <p v-if="privateKey" class="warning">
        <span class="warning-icon"><q-icon name="warning" size="lg" /></span>
        <span class="warning-content">
          {{
            $t(
              "Make sure you have a backup of your private key! Otherwise it is impossible to log back in to your account."
            )
          }}
        </span>
      </p>
      <input
        v-if="privateKey"
        :value="hexToBech32(privateKey, 'nsec')"
        readonly
      />
      <div class="buttons">
        <button class="btn btn-sm btn-primary" @click="logout" v-close-popup>
          {{ $t("Log out") }}
        </button>
        <button class="btn btn-sm" v-close-popup>{{ $t("Cancel") }}</button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import UserName from 'components/User/UserName.vue'
import { useAppStore } from 'stores/App'
import { useSettingsStore } from 'stores/Settings'
import { hexToBech32 } from 'src/utils/utils'

export default {
  name: 'LogoutDialog',
  components: {
    UserName,
  },
  props: {
    pubkey: {
      type: String,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogOpen: this.open,
    }
  },
  computed: {
    privateKey() {
      return useAppStore().activeAccount.privkey
    },
  },
  methods: {
    hexToBech32,
    logout() {
      useSettingsStore().removeAccount(this.pubkey)
    },
    show() {
      this.dialogOpen = true
    },
    dismiss() {
      this.dialogOpen = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.logout-dialog {
  position: relative;
  background-color: $color-bg;
  box-shadow: $shadow-white;
  padding: 1rem;
  min-width: 440px;

  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 0.5rem;
    left: 0.5rem;
    fill: #fff;
  }

  h3 {
    margin-top: 3rem;
    padding: 0 0.5rem;
  }
  > p {
    padding: 0 0.5rem;
  }

  .warning {
    color: $color-primary;
    display: flex;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
    border-radius: 1rem 1rem 0 0;
    padding: 1rem;
    margin-bottom: 0;
    &-icon {
      margin-right: 1rem;
    }
    &-content {
      font-weight: bold;
    }
  }

  input {
    color: #fff;
    height: 50px;
    width: 100%;
    padding: 12px 20px;
    border-radius: 0 0 1rem 1rem;
    margin: 0 auto 1rem;
    outline: none;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
    border: 1px solid rgba($color: $color-dark-gray, $alpha: 0);
  }

  .buttons {
    display: flex;
    flex-direction: row-reverse;
    padding-top: 1rem;

    button + button {
      margin-right: 1rem;
    }
  }
}
</style>

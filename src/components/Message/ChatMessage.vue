<template>
  <q-chat-message
    :sent="sent"
    :bg-color="sent ? 'grey-2' : 'pink-2'"
    :stamp="createdAt"
    class="chat-message"
  >
    <EncryptedMessage :message="message" click-to-decrypt />
  </q-chat-message>
</template>

<script>
import EncryptedMessage from 'components/Message/EncryptedMessage.vue'
import {useAppStore} from 'stores/App'
import DateUtils from 'src/utils/DateUtils'

export default {
  name: 'ChatMessage',
  components: {EncryptedMessage},
  props: {
    message: {
      type: Object,
      required: true,
    }
  },
  setup() {
    return {
      app: useAppStore()
    }
  },
  computed: {
    sent() {
      return this.message.author === this.app.myPubkey
    },
    createdAt() {
      return DateUtils.formatFromNowLong(this.message.createdAt)
    }
  },
}
</script>

<style lang="scss">
.chat-message {
  &.q-message-received .q-message-container {
    padding-right: 10%;
  }
  &.q-message-sent .q-message-container {
    padding-left: 10%;
  }
}
</style>

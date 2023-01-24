<template>
  <PageHeader back-button dense>
    <UserCard :pubkey="counterparty" class="conversation-header" clickable />
  </PageHeader>

  <div class="conversation">
    <div class="pusher"></div>
    <q-chat-message
      v-for="message in conversation"
      :key="message.id"
      :sent="message.author === app.myPubkey"
      :stamp="formatMessageDate(message.createdAt)"
    >
      <EncryptedMessage :message="message" />
    </q-chat-message>
    <p v-if="!conversation?.length" class="placeholder">
      This is the beginning of your message history with <UserName :pubkey="counterparty" clickable />.
    </p>
  </div>

  <div class="conversation-reply">
    <MessageEditor :recipient="counterparty" :placeholder="placeholder" @publish="onPublish" autofocus />
  </div>
</template>

<script>
import PageHeader from 'components/PageHeader.vue'
import UserCard from 'components/User/UserCard.vue'
import EncryptedMessage from 'components/Message/EncryptedMessage.vue'
import MessageEditor from 'components/Message/MessageEditor.vue'
import {useMessageStore} from 'src/nostr/store/MessageStore'
import {useAppStore} from 'stores/App'
import DateUtils from 'src/utils/DateUtils'
import {bech32ToHex} from 'src/utils/utils'
import UserName from 'components/User/UserName.vue'

export default {
  name: 'Conversation',
  components: {UserName, MessageEditor, EncryptedMessage, PageHeader, UserCard},
  setup() {
    return {
      app: useAppStore(),
      messages: useMessageStore(),
    }
  },
  computed: {
    counterparty() {
      return bech32ToHex(this.$route.params.pubkey)
    },
    conversation() {
      if (!this.app.isSignedIn) return
      return this.messages.getConversation(this.app.myPubkey, this.counterparty)
    },
    placeholder() {
      // TODO i18n
      return this.app.myPubkey === this.counterparty
        ? 'Jot something down'
        : 'Message'
    },
  },
  methods: {
    formatMessageDate(timestamp) {
      return DateUtils.formatFromNowLong(timestamp)
    },
    onPublish() {
      this.markAsRead()
      this.$nextTick(() => window.scrollTo(0, document.body.scrollHeight))
    },
    markAsRead() {
      if (this.app.isSignedIn && this.counterparty) {
        this.messages.markAsRead(this.app.myPubkey, this.counterparty)
      }
    },
  },
  mounted() {
    this.markAsRead()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.conversation-header {
  margin: 1px 0;
}

.conversation {
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem 80px;
  min-height: calc(100vh - 78px);
  .pusher {
    flex-grow: 1;
  }
  .placeholder {
    text-align: center;
  }
}

.conversation-reply {
  background: linear-gradient(to bottom, rgba($color: $color-bg, $alpha: 0), rgba($color: $color-bg, $alpha: 1) 6%);
  position: fixed;
  bottom: 0;
  z-index: 600;
  max-width: 658px;
  width: 100%;
  padding: 6px 0 26px;
}

@media screen and (max-width: $tablet) {
  .conversation-reply {
    padding-bottom: 22px;
  }
}

@media screen and (max-width: $phone-lg) {
  .conversation-reply {
    width: calc(100% - 80px);
  }
}

@media screen and (max-width: $phone) {
  .conversation-reply {
    width: 100%;
    padding-bottom: 1rem;
  }
}

</style>

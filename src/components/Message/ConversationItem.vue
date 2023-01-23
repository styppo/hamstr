<template>
  <div class="conversation-item" :class="{'has-unread': conversation.numUnread}" @click="goToConversation()">
    <div class="conversation-item-avatar">
      <UserAvatar :pubkey="conversation.pubkey" />
    </div>
    <div class="conversation-item-content">
      <div class="username">
        <UserName :pubkey="conversation.pubkey" show-verified />
      </div>
      <div v-if="conversation.latestMessage" class="message">
        <EncryptedMessage :message="conversation.latestMessage" />
      </div>
    </div>
    <div class="conversation-item-info">
      <div v-if="conversation.latestMessage" class="created-at">
        {{ createdAt }}
      </div>
      <q-badge
        v-if="conversation.numUnread"
        :label="conversation.numUnread"
        color="primary"
        class="unreads"
        rounded
      />
    </div>
  </div>
</template>

<script>
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import EncryptedMessage from 'components/Message/EncryptedMessage.vue'
import DateUtils from 'src/utils/DateUtils'
import {hexToBech32} from 'src/utils/utils'

export default {
  name: 'ConversationItem',
  components: {EncryptedMessage, UserName, UserAvatar},
  props: {
    conversation: {
      type: Object,
      required: true,
    },
  },
  computed: {
    createdAt() {
      if (!this.conversation.latestMessage) return
      const format = this.$q.screen.lt.md ? 'short' : 'long'
      return DateUtils.formatFromNow(this.conversation.latestMessage.createdAt, format)
    }
  },
  methods: {
    goToConversation() {
      this.$router.push({
        name: 'conversation',
        params: {
          pubkey: hexToBech32(this.conversation.pubkey, 'npub')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.conversation-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  transition: 120ms ease;
  &:hover {
    background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
  }
  &-avatar {
    margin-right: 12px;
  }
  &-content {
    flex-grow: 1;
    max-width: calc(100% - 160px);
    .message {
      font-size: 0.95em;
      max-height: 2rem;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  &-info {
    text-align: right;
    flex-grow: 1;
    .created-at {
      color: $color-light-gray;
      font-size: .95em;
    }
    .unreads {
      padding: 4px 6px;
      min-width: 20px;
      font-weight: bold;
      text-align: center;
    }
  }
  &.has-unread {
    .created-at {
      color: $color-primary;
    }
  }
  & + .conversation-item {
    border-top: $border-dark;
  }
}

@media screen and (max-width: $phone-lg) {
  .conversation-item-content {
    max-width: calc(100% - 90px);
  }
}

</style>

<style lang="scss">
@import "assets/variables.scss";
.conversation-item-content {
  .message p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

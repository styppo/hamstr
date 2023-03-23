<template>
  <div class="message-editor">
    <div class="input-section" @click="$refs.textarea.focus()">
      <AutoSizeTextarea
v-model="content" ref="textarea" :placeholder="placeholder" :disabled="publishing" :rows="1"
        @submit="publishMessage" submit-on-enter />
      <div class="inline-controls">
        <div class="inline-controls-item">
          <BaseIcon icon="emoji" />
          <q-menu ref="menuEmojiPicker">
            <EmojiPicker @select="onEmojiSelected" />
          </q-menu>
        </div>
      </div>
    </div>
    <div class="controls">
      <div class="controls-submit">
        <q-btn icon="send" :loading="publishing" :disable="!hasContent()" color="primary" @click="publishMessage" round />
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon/index.vue'
import EmojiPicker from 'components/CreatePost/EmojiPicker.vue'
import AutoSizeTextarea from 'components/CreatePost/AutoSizeTextarea.vue'
import { useAppStore } from 'stores/App'
import { useNostrStore } from 'src/nostr/NostrStore'
import EventBuilder from 'src/nostr/EventBuilder'
import { $t } from 'src/boot/i18n'
import { Account } from 'src/nostr/Account'
import { generatePrivateKey, getPublicKey } from 'nostr-tools'

export default {
  name: 'MessageEditor',
  components: {
    AutoSizeTextarea,
    BaseIcon,
    EmojiPicker,
  },
  props: {
    recipient: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Message',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['publish'],
  data() {
    return {
      content: '',
      publishing: false,
    }
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  methods: {
    hasContent() {
      return this.content.trim().length > 0
    },
    onEmojiSelected(emoji) {
      if (emoji.native) {
        this.$refs.menuEmojiPicker.hide()
        this.$refs.textarea.insertText(emoji.native)
      }
    },
    focus() {
      this.$refs.textarea.focus()
    },
    reset() {
      this.content = ''
    },
    async publishMessage() {
      this.publishing = true
      const content = this.content
      let pkConversation
      let skConversation = window.localStorage.getItem(this.recipient)

      // Generate and send our handshake
      if (!skConversation) {
        skConversation = generatePrivateKey()
        pkConversation = getPublicKey(skConversation)
        window.localStorage.set(this.recipient, skConversation)
        const skHandshake = generatePrivateKey()
        const pkHandshake = getPublicKey(skHandshake)
        console.log('Handshake key:', [pkHandshake, skHandshake])
        // The content body of the handshake message is itself
        // an event with kind 808, with the real pubkey of the account
        // and a p tag giving the new conversation pubkey.
        const handshakeEvent = new EventBuilder({
          kind: 808,
          created_at: Date.now(),
          pubkey: this.app.myPubkey,
          content: '',
          tags: [['p', pkConversation]]
        }).build()
        if (!(await this.app.signEvent(handshakeEvent))) return

        // The handshake event is signed with a one-time-use pubkey/privkey
        // pair
        const handshakeAccount = new Account({
          pubkey: pkHandshake,
          privkey: skHandshake
        })
        const ciphertext = await handshakeAccount.encrypt(
          this.recipient,
          JSON.stringify(handshakeEvent)
        )
        if (!ciphertext) return

        const event = EventBuilder.message(
          pkHandshake,
          this.recipient,
          ciphertext
        ).build()
        if (!(await handshakeAccount.sign(event))) return

        console.log('Handshake event:', event)

        if (await this.nostr.publish(event)) {
          this.reset()
          this.$nextTick(this.focus.bind(this))
          this.$emit('publish', event)
        } else {
          this.$q.notify({
            message: $t(`Failed to send message`),
            color: 'negative',
          })
        }
      } else {
        pkConversation = getPublicKey(skConversation)
      }

      // Send our message using the conversation key to a random key
      {
        // All private messages have an outer "decoy" shell NIP-04
        // event with the conversation pubkey as sender and a random
        // recipient.
        // The content of the message is the inner authentic NIP-04
        // with our real identity and content.

        // First we prepare the inner authentic message
        const innerCiphertext = await this.app.activeAccount.encrypt(
          this.recipient,
          content
        )
        const innerEvent = EventBuilder.message(
          this.app.myPubkey,
          this.recipient,
          innerCiphertext
        ).build()
        if (!(await this.app.activeAccount.sign(innerEvent))) return

        // Next, we prepare the outer message
        const conversationAccount = new Account({
          pubkey: pkConversation,
          privkey: skConversation
        })
        const outerCiphertext = await conversationAccount.encrypt(
          this.recipient,
          JSON.stringify(innerEvent)
        )
        console.log('Inner event:', innerEvent)

        const randomRecipient = generatePrivateKey()
        const outerEvent = EventBuilder.message(
          pkConversation,
          randomRecipient,
          outerCiphertext
        ).build()
        if (!(await conversationAccount.sign(outerEvent))) return
        console.log('Outer event:', outerEvent)

        if (await this.nostr.publish(outerEvent)) {
          this.reset()
          this.$nextTick(this.focus.bind(this))
          this.$emit('publish', outerEvent)
        } else {
          this.$q.notify({
            message: $t(`Failed to send message`),
            color: 'negative',
          })
        }
      }

      this.publishing = false
    },
  },
  mounted() {
    if (this.autofocus) {
      this.$nextTick(this.focus.bind(this))
    }
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.message-editor {
  display: flex;
  align-items: flex-end;
  padding: 0 1rem;
  width: 100%;

  .input-section {
    width: 100%;
    background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    border-radius: 1rem;
    position: relative;
    padding: 12px 36px 12px 1rem;
    margin-right: 0.5rem;

    textarea {
      display: block;
      width: 100%;
      max-height: 10rem;
      line-height: 18px;
      padding: 0;
      overflow: hidden;
      background-color: transparent;
      color: #fff;
      appearance: none;
      -webkit-appearance: none;
      resize: none;
      border: none;

      &:focus {
        border: none;
        outline: none;
      }
    }
  }

  .inline-controls {
    position: absolute;
    right: 4px;
    bottom: 5px;

    &-item {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      cursor: pointer;
      padding: 5px;

      svg {
        width: 100%;
        fill: $color-primary;
      }

      &:hover {
        background-color: rgba($color: $color-primary, $alpha: 0.3);
      }
    }
  }

  .controls {}
}
</style>
<style lang="scss">
@import "assets/theme/colors.scss";

.message-editor {
  .controls .controls-submit i.q-icon {
    margin-left: 4px;
  }
}
</style>

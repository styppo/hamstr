<template>
  <PostRenderer v-if="note" :note="note" />
  <span
    v-else-if="!decryptFailed"
    class="click-to-decrypt"
    @click="clickToDecrypt && decrypt()"
  >
    {{ $t("Click to decrypt") }}
  </span>
  <span v-else class="decrypt-failed" @click="decrypt">
    {{ $t("Decryption failed") }}
  </span>
</template>

<script>
import { useAppStore } from 'stores/App'
import PostRenderer from 'components/Post/Renderer/PostRenderer.vue'
import Note from 'src/nostr/model/Note'
import Event from 'src/nostr/model/Event'
import { verifySignature } from 'nostr-tools'

export default {
  name: 'EncryptedMessage',
  components: { PostRenderer },
  props: {
    message: {
      type: Object,
      required: true,
    },
    clickToDecrypt: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      app: useAppStore(),
    }
  },
  data() {
    return {
      decryptFailed: false,
    }
  },
  computed: {
    note() {
      if (!this.message?.plaintext) return
      const note = new Note(this.message.id, this.message)
      note.content = this.message.plaintext
      return note
    },
  },
  methods: {
    async decrypt() {
      if (this.message.plaintext) return
      try {
        const messageId = this.message.id
        const counterparty =
          this.message.author === this.app.myPubkey
            ? this.message.recipient
            : this.message.author
        const plaintext = await this.app.decryptMessage(
          counterparty,
          this.message.content
        )

        // We want to check in plaintext for handshake messages
        // and decode them
        let handshakeObject
        try {
          const SEPARATOR = '\n---------\n'
          if (plaintext.indexOf(SEPARATOR) !== -1) {
            handshakeObject = JSON.parse(plaintext.split(SEPARATOR).pop())
          }
        } catch {
          // NOP
        }

        if (handshakeObject instanceof Object &&
            typeof handshakeObject.pubkey === 'string' &&
            typeof handshakeObject.convkey === 'string' &&
            typeof handshakeObject.sig === 'string') {
          const handshakeEvent = new Event({
            pubkey: handshakeObject.pubkey,
            created_at: 0,
            kind: 0,
            tags: [['p', handshakeObject.convkey]],
            content: '',
            sig: handshakeObject.sig
          })
          handshakeEvent.id = handshakeEvent.hash()
          console.log('RECEIVED HANDSHAKE', handshakeObject, handshakeEvent)

          //if (verifySignature(handshakeEvent)) {
          if (verifySignature(handshakeEvent) === !!verifySignature(handshakeEvent)) { // TODO fix
            window.removeMessage(messageId) // hide this message from the user

            const subConv = window.clientSubscribe({
              kinds: [4],
              authors: [handshakeObject.convkey],
              limit: 0,
            }, `dm:${Date.now()}`)
            subConv.on('event', async event => {
              console.log('CONVERSATION EVENT', event)
              let plaintext = await window.dontHateMe.activeAccount.decrypt(
                handshakeObject.convkey,
                event.content
              )
              if (plaintext) {
                window.hiPhilipp(new Event(JSON.parse(plaintext)))
              }
            })
          } else {
            console.error('INVALID HANDSHAKE', handshakeEvent)
          }
          return
        }

        // The message can change while we are decrypting it, so we need to make sure not to cache the wrong message.
        if (this.message.id === messageId) {
          this.message.cachePlaintext(plaintext)
        }
      } catch (e) {
        console.error('Failed to decrypt message', e)
        this.decryptFailed = true
      }
    },
  },
  async mounted() {
    if (this.app.activeAccount.canDecrypt()) {
      await this.decrypt()
    }
  },
  watch: {
    async message() {
      if (this.app.activeAccount.canDecrypt()) {
        await this.decrypt()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.click-to-decrypt {
  cursor: pointer;
  font-size: 0.9rem;
}
.decrypt-failed {
  cursor: pointer;
  font-size: 0.9rem;
  color: $negative;
}
</style>

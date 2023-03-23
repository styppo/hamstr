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
        let plaintext = await this.app.decryptMessage(
          counterparty,
          this.message.content
        )

        try {
          const plaintextObject = JSON.parse(plaintext)
          if (plaintextObject instanceof Object &&
              plaintextObject.kind === 808) {
            plaintext = 'Start of encrypted convo yo'
            window.globalEmitMessageHack(plaintextObject)
          }
        } catch (e) {
          //...
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

<template>
  <PostRenderer v-if="note?.content" :note="note" />
  <span v-else-if="!decryptFailed" class="click-to-decrypt" @click="decrypt">Click to decrypt</span>
  <span v-else class="decrypt-failed" @click="decrypt">Decryption failed</span>
</template>

<script>
import {useAppStore} from 'stores/App'
import PostRenderer from 'components/Post/Renderer/PostRenderer.vue'
import Note from 'src/nostr/model/Note'

export default {
  name: 'EncryptedMessage',
  components: {PostRenderer},
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      app: useAppStore(),
    }
  },
  data() {
    return {
      plaintext: null,
      decryptFailed: false,
    }
  },
  computed: {
    note() {
      if (!this.message) return
      const note = new Note(this.message.id, this.message)
      note.content = this.message.plaintext || this.plaintext
      return note
    }
  },
  methods: {
    async decrypt() {
      try {
        const counterparty = this.message.author === this.app.myPubkey
          ? this.message.recipient
          : this.message.author
        this.plaintext = await this.app.decryptMessage(counterparty, this.message.content)
        this.message.cachePlaintext(this.plaintext)
      } catch (e) {
        console.error('Failed to decrypt message', e)
        this.decryptFailed = true
      }
    }
  },
  async mounted() {
    if (!this.message.plaintext && this.app.activeAccount.canDecrypt()) {
      await this.decrypt()
    }
  }
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

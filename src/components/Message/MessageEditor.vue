<template>
  <div class="message-editor">
    <div class="input-section" @click="$refs.textarea.focus()">
      <AutoSizeTextarea
        v-model="content"
        ref="textarea"
        :placeholder="placeholder"
        :disabled="publishing"
        :rows="1"
        @submit="publishMessage"
        submit-on-enter
      />
      <div class="inline-controls">
        <div class="inline-controls-item">
          <BaseIcon icon="emoji" />
          <q-menu ref="menuEmojiPicker">
            <EmojiPicker @select="onEmojiSelected"/>
          </q-menu>
        </div>
      </div>
    </div>
    <div class="controls">
      <div class="controls-submit">
        <q-btn
          icon="send"
          :loading="publishing"
          :disable="!hasContent()"
          color="primary"
          @click="publishMessage"
          round
        />
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon/index.vue'
import EmojiPicker from 'components/CreatePost/EmojiPicker.vue'
import AutoSizeTextarea from 'components/CreatePost/AutoSizeTextarea.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import EventBuilder from 'src/nostr/EventBuilder'

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
    }
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
      try {
        const ciphertext = await this.app.encryptMessage(this.recipient, this.content)
        if (!ciphertext) return
        const event = EventBuilder.message(this.app.myPubkey, this.recipient, ciphertext).build()
        if (!await this.app.signEvent(event)) return
        this.nostr.publish(event)

        this.reset()
        this.$nextTick(this.focus.bind(this))

        this.$emit('publish', event)
      } catch (e) {
        console.error('Failed to send message', e)
        this.$q.notify({
          message: `Failed to send message`,
          color: 'negative'
        })
      }
      this.publishing = false
    },
  },
  mounted() {
    if (this.autofocus) {
      this.$nextTick(this.focus.bind(this))
    }
  }
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
    margin-right: .5rem;
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
      cursor:pointer;
      padding: 5px;
      svg {
        width: 100%;
        fill: $color-primary
      }
      &:hover {
        background-color: rgba($color: $color-primary, $alpha: 0.3);
      }
    }
  }
  .controls {
  }
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

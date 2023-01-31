<template>
  <div class="post-editor" :class="{ compact, collapsed, connector }">
    <div class="post-editor-author">
      <div v-if="connector" class="connector-top">
        <div class="connector-line"></div>
      </div>
      <UserAvatar :pubkey="app.myPubkey" />
    </div>
    <div class="post-editor-content">
      <div class="input-section">
        <AutoSizeTextarea
          v-model="content"
          ref="textarea"
          :placeholder="placeholder"
          :disabled="publishing"
          @focus.once="collapsed = false"
        />
      </div>
      <div class="controls">
        <div class="controls-media">
          <div class="controls-media-item">
            <BaseIcon icon="emoji" />
            <q-menu ref="menuEmojiPicker">
              <EmojiPicker @select="onEmojiSelected" />
            </q-menu>
          </div>
          <div class="controls-media-item disabled">
            <BaseIcon icon="image" />
          </div>
        </div>
        <div class="controls-submit">
          <button
            :disabled="!hasContent() || publishing"
            @click="publishPost"
            class="btn btn-primary btn-sm"
          >
            <q-spinner v-if="publishing" />
            <span v-else>{{ $t("Post") }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="post-editor-fake-submit" v-if="collapsed">
      <button class="btn btn-primary btn-sm" disabled>{{ $t("Post") }}</button>
    </div>
  </div>
</template>

<script>
import AutoSizeTextarea from 'components/CreatePost/AutoSizeTextarea.vue'
import UserAvatar from 'components/User/UserAvatar.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import EmojiPicker from 'components/CreatePost/EmojiPicker.vue'
import { useAppStore } from 'stores/App'
import { useNostrStore } from 'src/nostr/NostrStore'
import EventBuilder from 'src/nostr/EventBuilder'
import { $t } from 'src/boot/i18n'

export default {
  name: 'PostEditor',
  components: {
    AutoSizeTextarea,
    BaseIcon,
    UserAvatar,
    EmojiPicker,
  },
  props: {
    ancestor: {
      type: Object,
      default: null,
    },
    placeholder: {
      type: String,
      default: "What's happening?",
    },
    compact: {
      type: Boolean,
      default: false,
    },
    connector: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['publish'],
  data() {
    return {
      content: '',
      collapsed: this.compact && !this.expanded,
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
      this.$refs.menuEmojiPicker.hide()
      this.$refs.textarea.insertText(emoji.native)
    },
    focus() {
      this.$refs.textarea.focus()
    },
    reset() {
      this.content = ''
    },
    async publishPost() {
      this.publishing = true

      const event = this.ancestor
        ? EventBuilder.reply(
            this.ancestor,
            this.app.myPubkey,
            this.content
          ).build()
        : EventBuilder.post(this.app.myPubkey, this.content).build()
      if (!(await this.app.signEvent(event))) return

      const numRelays = await this.nostr.publish(event)
      if (numRelays) {
        this.reset()
        this.$emit('publish', event)

        const postType = this.ancestor ? 'Reply' : 'Post'
        this.$q.notify({
          message: $t(`${postType} published to {numRelays} relays`, {
            numRelays,
          }),
          color: 'positive',
        })
      } else {
        this.$q.notify({
          message: $t(`Failed to publish post`),
          color: 'negative',
        })
      }

      this.publishing = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.post-editor {
  padding: 0 1rem;
  display: flex;
  width: 100%;
  &-author {
    display: flex;
    flex-direction: column;
    .connector-top {
      height: 1rem;
      padding-bottom: 4px;
    }
    .connector-line {
      width: 2px;
      height: 100%;
      margin: auto;
      background: rgb(56, 68, 77);
    }
  }
  &-content {
    margin-left: 12px;
    width: 100%;
    .input-section {
      width: 100%;
      textarea {
        appearance: none;
        -webkit-appearance: none;
        display: block;
        padding: 12px;
        font-size: 1.5rem;
        line-height: 1.3em;
        resize: none;
        background-color: transparent;
        border: none;
        width: 100%;
        min-height: 5rem;
        max-height: 30rem;
        border-radius: 5px;
        color: #fff;
        &:focus {
          border: none;
          outline: none;
        }
      }
    }
    .controls {
      border-top: $border-dark;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      &-media {
        display: flex;
        gap: 4px;
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
          &.disabled {
            cursor: default;
            svg {
              fill: rgba($color: $color-primary, $alpha: 0.5);
            }
            &:hover {
              background-color: transparent;
            }
          }
        }
      }
    }
  }
  &-fake-submit {
    height: fit-content;
    margin: auto;
  }
  &.compact {
    .input-section {
      textarea {
        padding: 10px 0;
        overflow: hidden;
      }
    }
    .controls {
      border-top: 0;
      padding: 0;
      margin-left: -4px;
    }

    &.collapsed {
      .input-section textarea {
        min-height: 48px;
        height: 48px;
      }
      .controls {
        display: none;
      }
    }
  }
  &.connector {
    .post-editor-content {
      margin-top: 1rem;
    }
    .post-editor-fake-submit {
      padding-top: 1rem;
    }
  }
}
</style>

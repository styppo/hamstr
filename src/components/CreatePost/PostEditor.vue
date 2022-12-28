<template>
  <div
    class="post-editor"
    :class="{
      'post-editor-compact': compact,
      'post-editor-compact-collapsed': collapsed
    }"
  >
    <div class="post-editor-avatar">
      <BaseUserAvatar :pubkey="$store.state.keys.pub" />
    </div>
    <div class="post-editor-content">
      <div class="input-section">
        <AutoSizeTextarea
          v-model="post.text"
          ref="textarea"
          :placeholder="placeholder"
          @focus.once="collapsed = false"
        />
<!--        <div-->
<!--          v-if="tweetContent.imageList"-->
<!--          class="tweet-section-images"-->
<!--        >-->
<!--          <div-->
<!--            v-for="(image, i) in tweetContent.imageList"-->
<!--            :key="i"-->
<!--            class="image-container"-->
<!--          >-->
<!--            <img :src="image.url">-->
<!--            <div-->
<!--              class="close-button"-->
<!--              @click="deleteImage(i)"-->
<!--            >-->
<!--              <base-icon icon="close" />-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
      </div>
      <div class="controls">
        <div class="controls-media">
          <div class="controls-media-item">
            <BaseIcon icon="emoji" />
            <q-menu ref="menuEmojiPicker">
              <EmojiPicker @select="onEmojiSelected"/>
            </q-menu>
          </div>

<!--          <div-->
<!--            class="controls-media-item"-->
<!--            @click="$refs.uploadImageInput.click()"-->
<!--          >-->
<!--            <BaseIcon icon="image" />-->
<!--            <input-->
<!--              ref="uploadImageInput"-->
<!--              type="file"-->
<!--              accept="image/*"-->
<!--              hidden-->
<!--              @change="showFiles"-->
<!--            >-->
<!--          </div>-->
<!--          <div class="controls-media-item">-->
<!--            <BaseIcon icon="gif" />-->
<!--          </div>-->
<!--          <div class="controls-media-item">-->
<!--            <BaseIcon icon="graph" />-->
<!--          </div>-->
        </div>
        <div class="controls-submit">
          <button :disabled="!hasPostText()" @click="handleSubmit" class="btn">
            Post
          </button>
        </div>
      </div>
    </div>
    <button v-if="collapsed" class="btn" disabled>Post</button>
  </div>
</template>

<script>
import AutoSizeTextarea from 'components/CreatePost/AutoSizeTextarea.vue'
import BaseUserAvatar from 'components/BaseUserAvatar.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import EmojiPicker from 'components/CreatePost/EmojiPicker.vue'

export default {
  name: 'PostEditor',
  components: {
    AutoSizeTextarea,
    BaseIcon,
    BaseUserAvatar,
    EmojiPicker,
  },
  props: {
    placeholder: {
      type: String,
      default: 'What\'s happening?',
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      post: {
        text: '',
      },
      collapsed: this.compact,
    }
  },
  methods: {
    hasPostText() {
      return this.post.text.trim().length > 0
    },
    handleSubmit() {
    },
    onEmojiSelected(emoji) {
      this.$refs.menuEmojiPicker.hide()
      this.$refs.textarea.insertText(emoji.native)
    },
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

button.btn {
  cursor: pointer;
  background-color: $color-primary;
  color: #fff;
  font-weight: bold;
  padding: 8px 16px;
  outline: none;
  border: none;
  border-radius: 9999px;
  height: fit-content;
  &:disabled {
    cursor: no-drop;
    background-color: rgba($color: $color-primary, $alpha: 0.3);
    color: rgba($color: #fff, $alpha: 0.3);
  }
}

.post-editor {
  padding: 0 1rem;
  display: flex;
  width: 100%;
  &-avatar {
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
    }
  }
  &-compact {
    .input-section {
      textarea {
        padding: 10px 0;
        min-height: 48px;
        height: 48px;
        overflow: hidden;
      }
    }
    .controls {
      border-top: 0;
      padding: 0;
      margin-left: -4px;
    }

    &-collapsed {
      .controls {
        display: none;
      }
      > button {
        margin: auto;
      }
    }
  }
}
</style>

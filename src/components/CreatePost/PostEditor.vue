<template>
  <div class="post-editor">
    <div class="post-editor-avatar">
      <BaseUserAvatar :pubkey="$store.state.keys.pub" />
    </div>
    <div class="post-editor-content">
      <div class="input-section">
        <AutoSizeTextarea
          v-model="post.text"
          ref="textarea"
          placeholder="What's happening?"
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
              <EmojiPicker
                color="#1da1f2"
                @select="onEmojiSelected"/>
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
          <button
            :disabled="!hasPostText()"
            @click="handleSubmit"
          >
            Post
          </button>
        </div>
      </div>
    </div>
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
  data() {
    return {
      post: {
        text: '',
      },
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

.post-editor {
  padding: 10px 1rem 0;
  display: flex;
  width: 100%;
  border-bottom: $border-dark;
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
        resize: vertical;
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
      &-images {
        display: flex;
        padding: 1rem;
        .image-container {
          & + .image-container {
            margin-left: 15px;
          }
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-grow: 1;
          img {
            width: 100%;
          }
          .close-button {
            position: absolute;
            background-color: rgba($color: $color-dark-gray, $alpha: 0.3);
            top: 0;
            right: 0;
            cursor: pointer;
            margin-top: 10px;
            margin-right: 10px;
            width: 2rem;
            height: 2rem;
            border-radius: 999px;
            padding: 7px;
            svg {
              width: 100%;
              height: 100%;
              fill: #fff;
            }
          }
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
            fill: $color-blue
          }
          &:hover {
            background-color: rgba($color: $color-blue, $alpha: 0.3);
          }
        }
      }
      &-submit {
        button {
          cursor: pointer;
          background-color: $color-blue;
          color: #fff;
          font-weight: bold;
          padding: 10px 16px;
          outline: none;
          border: none;
          border-radius: 9999px;
          &:disabled{
            cursor: no-drop;
            background-color: rgba($color: $color-blue, $alpha: 0.3);
            color: rgba($color: #fff, $alpha: 0.3);
          }
        }
      }
    }
  }
}
</style>

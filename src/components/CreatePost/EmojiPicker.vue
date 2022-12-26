<template>
  <Picker
    :data="emojiIndex"
    :native="true"
    :show-skin-tones="true"
    emoji="thumbsup"
    title=""
    color="#ee517d"
    @select="onSelect"
  />
</template>

<script>
import emojiData from 'emoji-mart-vue-fast/data/all.json'
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src'
import 'emoji-mart-vue-fast/css/emoji-mart.css'

export default {
  name: 'EmojiPicker',
  components: {
    Picker
  },
emits: ['select'],
  data() {
    return {
      emojiIndex: new EmojiIndex(emojiData)
    }
  },
  methods: {
    onSelect(emoji) {
      this.$emit('select', emoji)
    }
  }
}
</script>

<style lang="scss">
.emoji-mart-preview {
  overflow: hidden;
  &-name {
    white-space: nowrap;
  }
  &-emoticons {
    display: none;
  }
}
</style>

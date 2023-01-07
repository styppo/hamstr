<template>
  <div class="thread">
    <ListPost
      v-for="(note, index) in thread"
      :key="note.id"
      :note="note"
      :connector-top="thread.length > 1 && index > 0"
      :connector-bottom="(thread.length > 1 && index < thread.length - 1) || forceBottomConnector"
      actions
      clickable
    />
  </div>
</template>

<script>
import ListPost from 'components/Post/ListPost.vue'

export default {
  name: 'Thread',
  components: {
    ListPost
  },
  props: {
    thread: {
      type: Array,
      required: true,
    },
    forceBottomConnector: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.thread {
  border-bottom: $border-dark;
  .post {
    border-bottom: 0;
  }
}
</style>

<template>
  <div class="thread">
    <ListPost
      v-for="(note, index) in filteredThread"
      :key="note.id"
      :note="note"
      :connector-top="filteredThread.length > 1 && index > 0"
      :connector-bottom="(filteredThread.length > 1 && index < filteredThread.length - 1) || forceBottomConnector"
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
  computed: {
    filteredThread() {
      return this.thread.filter(note => !!note)
    }
  }
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

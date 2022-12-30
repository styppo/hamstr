<template>
  <div class="thread">
    <ListPost
      v-for="(event, index) in events"
      :key="event.id"
      :event="event"
      :connector-top="events.length > 1 && index > 0"
      :connector-bottom="(events.length > 1 && index < events.length - 1) || forceBottomConnector"
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
    events: {
      type: Array,
      required: true,
    },
    forceBottomConnector: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    //console.log(`Thread (${this.events.length}) ${this.events[0].content.substr(0, 100)}`, this.events)
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

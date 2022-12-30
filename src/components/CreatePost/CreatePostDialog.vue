<template>
  <q-dialog
    v-model="$store.state.postDialogOpen"
    @before-show="updateReplyToEvent"
    @show="$refs.postEditor.focus()"
    @hide="onClose"
  >
    <div class="create-post-dialog">
      <q-btn v-close-popup icon="close" size="md" flat round class="icon" />

      <ListPost
        v-if="replyToEvent"
        :event="replyToEvent"
        connector-bottom
      />
      <PostEditor
        ref="postEditor"
        class="post-editor"
        :class="{standalone: !replyToEvent}"
        :placeholder="placeholderText"
        :connector="!!replyToEvent"
        :reply-to="replyTo"
        @publish="onClose"
        compact
        expanded
      />
    </div>
  </q-dialog>
</template>

<script>
import ListPost from 'components/Post/ListPost.vue'
import PostEditor from 'components/CreatePost/PostEditor.vue'
import {dbStreamEvent} from 'src/query'
import helpers from 'src/utils/mixin'

export default {
  name: 'CreatePostDialog',
  mixins: [helpers],
  components: {
    ListPost,
    PostEditor
  },
  data() {
    return {
      replyToEvent: null,
    }
  },
  computed: {
    paramsReplyTo() {
      return this.$store.state.postDialogParams?.replyTo || []
    },
    replyTo() {
      const replyTo = this.paramsReplyTo.map(id => ({id}))
      if (replyTo.length && this.replyToEvent && this.replyToEvent.id === replyTo[replyTo.length - 1].id) {
        replyTo[replyTo.length - 1].pubkey = this.replyToEvent.pubkey
      }
      return replyTo
    },
    placeholderText() {
      return this.replyToEvent
        ? 'Post your reply'
        : 'What\'s happening?'
    },
  },
  methods: {
    fetchEvent(id) {
      return new Promise((resolve, reject) => {
        return dbStreamEvent(id, event => {
          this.interpolateEventMentions(event)
          this.$store.dispatch('useProfile', {pubkey: event.pubkey})
          resolve(event)
        }).catch(reject)
      })
    },
    async updateReplyToEvent() {
      if (this.paramsReplyTo.length > 0) {
        const ancestor = this.paramsReplyTo[this.paramsReplyTo.length - 1]
        if (!this.replyToEvent || ancestor.id !== this.replyToEvent.id) {
          this.replyToEvent = await this.fetchEvent(ancestor)
        }
      } else {
        this.replyToEvent = null
      }
    },
    onClose() {
      this.$refs.postEditor.reset()
      this.$store.commit('dismissPostDialog')
    }
  },
  async mounted() {
    await this.updateReplyToEvent()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.create-post-dialog {
  position: relative;
  background-color: $color-bg;
  padding: 3rem 1rem 1rem;
  min-width: 440px;
  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    top: .5rem;
    left: .5rem;
    fill: #fff;
  }
  .post {
    padding: 0;
    border-bottom: 0;
  }
  .post-editor {
    padding: 0;
    &.standalone {
      margin-top: 1rem;
    }
  }
}
</style>

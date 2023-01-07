<template>
  <q-dialog
    v-model="app.createPostDialog.open"
    @before-show="updateAncestor"
    @show="$refs.postEditor.focus()"
  >
    <div class="create-post-dialog">
      <q-btn v-close-popup icon="close" size="md" flat round class="icon" />

      <ListPost
        v-if="ancestor"
        :note="ancestor"
        connector-bottom
      />
      <PostEditor
        ref="postEditor"
        class="post-editor"
        :class="{standalone: !isReply}"
        :placeholder="placeholderText"
        :connector="isReply"
        :ancestor="ancestor"
        @publish="app.createPostDialog.open = false"
        compact
        expanded
      />
    </div>
  </q-dialog>
</template>

<script>
import ListPost from 'components/Post/ListPost.vue'
import PostEditor from 'components/CreatePost/PostEditor.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'

export default {
  name: 'CreatePostDialog',
  components: {
    ListPost,
    PostEditor
  },
  data() {
    return {
      ancestor: null,
    }
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  computed: {
    paramAncestor() {
      return this.app.createPostDialog?.params?.ancestor
    },
    isReply() {
      return !!this.paramAncestor
    },
    placeholderText() {
      return this.isReply
        ? 'Post your reply'
        : 'What\'s happening?'
    },
  },
  methods: {
    updateAncestor() {
      this.ancestor = this.paramAncestor
        ? this.nostr.getNote(this.paramAncestor)
        : null
    },
  },
  async mounted() {
    this.updateAncestor()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.create-post-dialog {
  position: relative;
  background-color: $color-bg;
  padding: 3rem 1rem 1rem;
  min-width: 660px;
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

@media screen and (max-width: $phone-lg) {
  .create-post-dialog {
    min-width: unset;
    width: 100%;
  }
}

</style>

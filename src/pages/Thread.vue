<template>
  <q-page ref="page">
    <PageHeader :title="$t('thread')" back-button />

    <div ref="ancestors">
      <Thread
        v-if="ancestors?.length"
        :thread="ancestors"
        force-bottom-connector
        class="ancestors"
      />
    </div>

    <q-item ref="main" class="no-padding column">
      <HeroPost
        v-if="note?.id"
        :note="note"
        :connector="ancestors.length > 0"
      />
      <div v-else style="padding-left: 1.5rem">
        <q-spinner size="sm" style="margin-right: .5rem"/> Loading...
      </div>
    </q-item>

    <div v-if="children.length">
      <div v-for="thread in children" :key="thread[0].id">
        <Thread :thread="thread" />
      </div>
    </div>

    <div style="min-height: 80vh;" />
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import PageHeader from 'components/PageHeader.vue'
import Thread from 'components/Post/Thread.vue'
import HeroPost from 'components/Post/HeroPost.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {NoteOrder} from 'src/nostr/store/NoteStore'
import {bech32ToHex} from 'src/utils/utils'

export default defineComponent({
  name: 'ThreadPage',
  components: {
    HeroPost,
    Thread,
    PageHeader,
  },
  setup() {
    return {
      nostr: useNostrStore()
    }
  },
  data() {
    return {
      predecessors: [],
      children: [],
      subId: null,
      resizeObserver: null,
    }
  },
  computed: {
    noteId() {
      return bech32ToHex(this.$route.params.id)
    },
    note() {
      if (!this.noteId) return
      return this.nostr.getNote(this.noteId)
    },
    noteLoaded() {
      return this.noteId && this.note?.id === this.noteId
    },
    rootId() {
      if (!this.noteLoaded) return
      return this.note.hasAncestor()
        ? this.note.root()
        : this.note.id
    },
    root() {
      if (!this.rootId) return
      return this.nostr.getNote(this.rootId)
    },
    rootLoaded() {
      if (!this.noteLoaded) return
      return this.root?.id === this.rootId
    },
    ancestors() {
      if (!this.rootLoaded) return []
      const root = this.rootId !== this.noteId
        ? [this.root]
        : []
      return root.concat(this.predecessors)
    }
  },
  methods: {
    startStream() {
      if (!this.rootId) return
      this.stream = this.nostr.streamThread(this.rootId)
      this.stream.on('init', this.buildThread.bind(this))
    },

    closeStream() {
      if (!this.stream) return
      this.stream.close()
      this.stream = null
    },

    buildThread() {
      if (!this.noteLoaded) return
      const ancestors = this.allAncestors(this.note)
      const ancestor = ancestors.length
        ? ancestors[ancestors.length - 1]
        : null

      // Sanity check
      if (ancestors.length > 0 && ancestors[0].id !== this.rootId) {
        console.error(`Invalid thread structure: expected root ${this.rootId} but found ${ancestors[0].id}`)
        return
      }

      this.predecessors = this
        .collectPredecessors(ancestors, this.note)
        .slice(1)

      this.scrollToMain()

      this.children = this.collectChildren(this.note, ancestor)
    },

    collectPredecessors(ancestors, target) {
      if (!ancestors || !ancestors.length) return []

      const ancestor = ancestors.pop()
      const replies = this.nostr.getRepliesTo(ancestor.id, NoteOrder.CREATION_DATE_ASC)
      const targetIdx = replies.findIndex(reply => reply.id === target.id)
      const predecessors = [ancestor].concat(replies.slice(0, targetIdx))

      return this
        .collectPredecessors(ancestors, ancestor)
        .concat(predecessors)
    },

    collectChildren(target, ancestor) {
      const children = []

      // Get same-level successors
      if (ancestor) {
        const ancestorReplies = this.nostr.getRepliesTo(ancestor.id, NoteOrder.CREATION_DATE_ASC)
        const targetIdx = ancestorReplies.findIndex(reply => reply.id === target.id)
        const successors = ancestorReplies.slice(targetIdx + 1)
        if (successors.length) {
          children.push(successors)
        }
      }

      // Get children of target
      const targetReplies = this.nostr.getRepliesTo(target.id, NoteOrder.CREATION_DATE_DESC)
      for (const reply of targetReplies) {
        children.push(this.unrollLongest(reply))
      }

      return children
    },

    // Unrolls linear replies until first "fork"
    unrollLinear(root) {
      const thread = [root]
      let replies = this.nostr.getRepliesTo(root.id, NoteOrder.CREATION_DATE_ASC)
      while (replies.length === 1) {
        thread.push(replies[0])
        root = replies[0]
        replies = this.nostr.getRepliesTo(root.id, NoteOrder.CREATION_DATE_ASC)
      }
      return thread
    },

    // Unrolls the longest thread in the subtree
    unrollLongest(root) {
      let threads = []
      let replies = this.nostr.getRepliesTo(root.id, NoteOrder.CREATION_DATE_ASC)
      for (const reply of replies) {
        threads.push(this.unrollLongest(reply))
      }

      let longest = []
      for (const sub of threads) {
        if (sub.length >= longest.length) {
          longest = sub
        }
      }

      return [root].concat(longest)
    },

    allAncestors(note) {
      if (!note.hasAncestor()) return []
      const ancestor = this.nostr.getNote(note.ancestor())
      if (!ancestor) {
        console.error(`Couldn't fetch ancestor ${note.ancestor()}`)
        return []
      }
      return this.allAncestors(ancestor).concat([ancestor])
    },

    scrollToMain() {
      const el = this.$refs.main?.$el
      if (!el) return

      // TODO Clean up
      const offset = this.$q.screen.xs ? 61 : 78
      const position = Math.max(el.offsetTop - offset, 0)

      window.scrollTo(0, position)
    },
  },
  watch: {
    root() {
      if (this.rootLoaded) {
        this.startStream()
      }
    }
  },
  mounted() {
    this.startStream()
    this.buildThread()

    this.resizeObserver = new ResizeObserver(this.scrollToMain.bind(this))
    this.resizeObserver.observe(this.$refs.ancestors)
    setTimeout(() => this.resizeObserver.disconnect(), 2000)
  },
  unmounted() {
    this.closeStream()
    this.resizeObserver.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.ancestors {
  border-bottom: 0;
}
</style>

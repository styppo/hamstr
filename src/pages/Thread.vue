<template>
  <q-page ref="page">
    <PageHeader :title="$t('thread')" back-button />

    <div
      ref="ancestors"
      v-if="ancestorsCompiled.length || rootAncestor"
    >
      <Thread
        :events="ancestorsCompiled"
        force-bottom-connector
        @add-event="addEventAncestors"
        class="ancestors"
      />
    </div>

    <q-item ref="main" class="no-padding column">
      <HeroPost
        v-if="event"
        :event="event"
        :highlighted="true"
        :position="ancestors.length ? 'last' : 'standalone'"
        :connector="ancestorsCompiled.length > 0"
        @add-event="processChildEvent"
      />
      <div v-else>
        {{ $t('event') }} {{ $route.params.eventId }}
      </div>
    </q-item>

    <div v-if="childrenThreadsFiltered.length">
      <div v-for="(thread) in childrenThreadsFiltered" :key="thread[0].id">
        <Thread :events="thread" @add-event='processChildEvent'/>
      </div>
    </div>

    <div style="min-height: 70vh;" />
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import {createMetaMixin} from 'quasar'
import PageHeader from 'components/PageHeader.vue'
import Thread from 'components/Post/Thread.vue'
import HeroPost from 'components/Post/HeroPost.vue'
import {dbStreamEvent, dbStreamTagKind} from '../query'
import helpersMixin from '../utils/mixin'
import {addToThread} from '../utils/threads'

const metaData = {
  // sets document title
  title: 'hamstr - thread',

  // meta tags
  meta: {
    description: { name: 'description', content: 'Nostr event thread' },
    keywords: { name: 'keywords', content: 'nostr decentralized social media' },
    equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
  },
}

export default defineComponent({
  name: 'Event',
  emits: ['scroll-to-rect'],
  mixins: [helpersMixin, createMetaMixin(metaData)],
  components: {
    HeroPost,
    Thread,
    PageHeader,
  },

  data() {
    return {
      replying: false,
      ancestors: [],
      ancestorsSeen: new Map(),
      ancestorIds: [],
      rootAncestor: null,
      event: null,
      childrenThreads: [],
      childrenSet: new Set(),
      sub: {},
      profilesUsed: new Set(),

      resizeObserver: null,
      scrollTimeout: null,
    }
  },

  computed: {
    childrenThreadsFiltered() {
      return this.childrenThreads.filter(thread => thread[0].interpolated.replyEvents.includes(this.$route.params.eventId))
    },
    ancestorsCompiled() {
      if (!this.rootAncestor) return this.ancestors
      if (this.ancestors.length && this.rootAncestor && this.ancestors[0].id === this.rootAncestor.id) return this.ancestors
      return [this.rootAncestor].concat(this.ancestors)
    }
  },

  mounted() {
    this.start()

    this.resizeObserver = new ResizeObserver(() => {
      this.scrollToMainEvent()
    })
    this.resizeObserver.observe(this.$refs.page.$el)
  },

  beforeUnmount() {
    this.stop()

    this.resizeObserver.disconnect()
  },

  methods: {
    async start() {
      this.sub.event = await dbStreamEvent(this.$route.params.eventId, event => {
        let getAncestorsChildren = false
        if (!this.event) getAncestorsChildren = true
        this.interpolateEventMentions(event)
        this.event = null
        this.event = event
        if (getAncestorsChildren) {
          if (this.event.interpolated.replyEvents.length) this.subRootAncestor()
          this.subAncestorsChildren()
        }
        this.useProfile(event.pubkey)
      }, true)
      await this.subAncestorsChildren()
    },

    stop() {
      this.replying = false
      if (this.sub.event) this.sub.event.cancel()
      if (this.sub.ancestorsChildren) this.sub.ancestorsChildren.cancel()
      if (this.sub.rootAncestor) this.sub.rootAncestor.cancel()
      this.profilesUsed.forEach(pubkey => this.$store.dispatch('cancelUseProfile', {pubkey}))
    },

    async subRootAncestor() {
      this.sub.rootAncestor = await dbStreamEvent(this.event.interpolated.replyEvents[0], event => {
        this.processAncestorEvent(event)
        this.sub.rootAncestor.cancel()
      })
    },

    async subAncestorsChildren() {
      let tags = this.event?.interpolated?.replyEvents?.length ? [this.$route.params.eventId, this.event.interpolated.replyEvents[0]] : [this.$route.params.eventId]

      if (this.sub.ancestorsChildren) {
        this.sub.ancestorsChildren.update('e', tags, 1)
      } else {
        this.sub.ancestorsChildren = await dbStreamTagKind('e', tags, 1, event => {
          if (this.event && event.created_at < this.event.created_at) {
            this.processAncestorEvent(event)
            return
          }
          this.processChildEvent(event)
        })
      }
    },

    processAncestorEvent(event) {
      let currAncestor = this.ancestors.length ? this.ancestors[this.ancestors.length - 1] : this.event
      if (currAncestor.interpolated.replyEvents.length === 0) return

      let existing = this.ancestorsSeen.get(event.id)
      if (existing) return

      this.interpolateEventMentions(event)
      this.ancestorsSeen.set(event.id, event)
      if (this.event?.interpolated?.replyEvents?.[0] === event.id) this.rootAncestor = event

      let prevAncestorId = currAncestor.interpolated.replyEvents[currAncestor.interpolated.replyEvents.length - 1]
      if (prevAncestorId === event.id) {
        let prevAncestor = event
        while (prevAncestor) {
          this.ancestors = [prevAncestor].concat(this.ancestors)
          this.useProfile(prevAncestor.pubkey)
          currAncestor = prevAncestor
          prevAncestorId = currAncestor.interpolated.replyEvents[currAncestor.interpolated.replyEvents.length - 1]
          prevAncestor = this.ancestorsSeen.get(prevAncestorId)
        }
      }
    },

    processChildEvent(event) {
      if (event.id === this.$route.params.eventId) return
      if (this.childrenSet.has(event.id)) return

      this.childrenSet.add(event.id)
      this.useProfile(event.pubkey)
      this.interpolateEventMentions(event)
      addToThread(this.childrenThreads, event, '', event.pubkey !== this.$store.state.keys.pub)
    },

    scrollToMainEvent() {
      const el = this.$refs.main?.$el
      if (!el) return

      const offset = Math.max(el.offsetTop - 78, 0)

      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
      }
      this.scrollTimeout = setTimeout(() => window.scrollTo(0, offset), 100)
    },

    addEventAncestors(event) {
      this.interpolateEventMentions(event)
      this.toEvent(event.id)
    },

    useProfile(pubkey) {
      if (this.profilesUsed.has(pubkey)) return

      this.profilesUsed.add(pubkey)
      this.$store.dispatch('useProfile', {pubkey})
    },
  }
})
</script>

<style lang="scss" scoped>
.ancestors {
  border-bottom: 0;
}
</style>

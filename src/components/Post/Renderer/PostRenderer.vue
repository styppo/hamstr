<template>
  <BaseMarkdown :content="content" />
</template>

<script>
import BaseMarkdown from 'components/Post/Renderer/BaseMarkdown.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {TagType} from 'src/nostr/model/Event'
import {bech32ToHex, hexToBech32, shortenBech32} from 'src/utils/utils'
import routerMixin from 'src/router/mixin'

export default {
  name: 'PostRenderer',
  components: {BaseMarkdown},
  mixins: [routerMixin],
  props: {
    note: {
      type: Object,
      required: true,
    }
  },
  setup() {
    return {
      nostr: useNostrStore(),
    }
  },
  computed: {
    content() {
      let content = this.note.content
      content = this.replaceBech32Refs(content)
      content = this.replaceTagRefs(content)
      return content
    },
  },
  methods: {
    replaceTagRefs(str) {
      if (!str) return str
      return str.replace(/#\[([0-9]+)]/ig, (match, index) => {
        const tag = this.note.tags[index]
        if (!tag) return match
        const rendered = this.renderTag(tag)
        if (!rendered) return match
        return rendered
      })
    },
    renderTag(tag) {
      switch (tag.type) {
        case TagType.PUBKEY: {
          const bech32 = hexToBech32(tag.ref, 'npub')
          return this.renderProfileRef(bech32)
        }
        case TagType.EVENT: {
          const bech32 = hexToBech32(tag.ref, 'note')
          return this.renderNoteRef(bech32)
        }
      }
    },
    replaceBech32Refs(str) {
      if (!str) return str
      return str.replace(/@((npub|note)[a-z0-9]{59})/ig, (match, bech32, prefix) => {
        switch (prefix) {
          case 'npub':
            return this.renderProfileRef(bech32)
          case 'note':
            return this.renderNoteRef(bech32)
          default:
            return match
        }
      })
    },
    renderProfileRef(bech32) {
      const profile = this.nostr.getProfile(bech32ToHex(bech32))
      const text = profile
        ? profile.name
        : shortenBech32(bech32)
      if (!bech32 || !text) return
      const link = this.linkToProfile(bech32)
      return `[${text}](${link})`
    },
    renderNoteRef(bech32) {
      if (!bech32) return
      const text = shortenBech32(bech32)
      const link = this.linkToThread(bech32)
      return `[${text}](${link})`
    },
  },
}
</script>

<style scoped>

</style>

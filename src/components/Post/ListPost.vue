<template>
  <div
    class="post"
    :class="{clickable}"
    @click.stop="clickable && goToThread(note.id)"
  >
    <div class="post-author">
      <div class="connector-top">
        <div v-if="connectorTop" class="connector-line"></div>
      </div>
      <UserAvatar :pubkey="note.author" clickable @click.stop />
      <div class="connector-bottom">
        <div v-if="connectorBottom" class="connector-line"></div>
      </div>
    </div>
    <div class="post-content">
      <div class="post-content-header">
        <p class="author-line">
          <UserName :pubkey="note.author" clickable show-verified @click.stop />
          <span>&#183;</span>
          <span class="created-at">{{ createdAt }}</span>
        </p>
        <p v-if="note.hasAncestor()" class="in-reply-to">
          Replying to
          <a @click.stop="goToProfile(ancestor?.author)">
            <UserName v-if="ancestor?.author" :pubkey="ancestor?.author" />
          </a>
        </p>
      </div>
      <div class="post-content-body">
        <PostRenderer :note="note" />
      </div>
      <div v-if="showActions" class="post-content-actions">
        <PostActions :note="note" />
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import PostRenderer from 'components/Post/Renderer/PostRenderer.vue'
import PostActions from 'components/Post/PostActions.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import routerMixin from 'src/router/mixin'
import DateUtils from 'src/utils/DateUtils'

export default {
  name: 'ListPost',
  mixins: [routerMixin],
  components: {
    PostActions,
    UserAvatar,
    UserName,
    PostRenderer,
  },
  props: {
    note: {
      type: Object,
      required: true
    },
    connectorTop: {
      type: Boolean,
      default: false,
    },
    connectorBottom: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore(),
    }
  },
  data() {
    return {
      refreshCounter: 0,
      refreshTimer: null,
    }
  },
  computed: {
    ancestor() {
      return this.note.hasAncestor()
        ? this.nostr.getNote(this.note.ancestor())
        : null
    },
    showActions() {
      return this.actions && this.note.canReply()
    },
    createdAt() {
      // Mention refreshCounter to make this property react to changes to it
      this.refreshCounter
      return this.formatPostDate(this.note.createdAt)
    },
  },
  methods: {
    formatPostDate(timestamp) {
      const format = this.$q.screen.lt.md ? 'short' : 'long'
      return DateUtils.formatFromNow(timestamp, format)
    },
  },
  mounted() {
    const updateInterval = DateUtils.now() - this.note.createdAt >= 3600 // 1h
      ? 3600 // 1h
      : 60 // 1m
    this.refreshTimer = setInterval(() => this.refreshCounter++, updateInterval * 1000)
  },
  unmounted() {
    clearInterval(this.refreshTimer)
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.post {
  padding: 0 1rem;
  display: flex;
  transition: 100ms ease background-color;
  border-bottom: $border-dark;
  &:last-child {
    border-bottom: 0;
  }
  &.clickable {
    cursor: pointer;
    &:hover {
      background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
    }
  }
  &-author {
    display: flex;
    flex-direction: column;
    .connector-top {
      height: 1rem;
      padding-bottom: 4px;
    }
    .connector-bottom {
      flex-grow: 1;
      padding-top: 4px;
    }
    .connector-line {
      width: 2px;
      height: 100%;
      margin: auto;
      background: rgb(56, 68, 77);
    }
  }
  &-content {
    margin-left: 12px;
    padding: 1rem 0 .4rem;
    flex-grow: 1;
    max-width: 570px;
    &-header {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .author-line {
        display: flex;
        .username {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .in-reply-to {
        color: $color-dark-gray;
        a {
          color: $color-primary;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      p {
        &:first-child {
          margin: 0;
        }
        &:last-child {
          margin: 0 0 8px;
        }
        > span {
          color: $color-dark-gray;
          &:first-child {
            color: #fff;
          }
          & + span {
            margin-left: 8px;
          }
          &.nip05 {
          }
          &.created-at {
          }
        }
      }
    }
    &-body {
      color: #fff;
      margin-bottom: .5rem;
    }
    &-actions {
    }
  }
}

@media screen and (max-width: $phone) {
  .post {
    &-content {
      max-width: calc(100% - 48px - 1rem);
      &-body {
        margin-bottom: .5rem;
      }
    }
  }
}
</style>

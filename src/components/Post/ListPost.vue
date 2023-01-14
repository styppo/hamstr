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
          <span class="created-at">{{ formatPostDate(note.createdAt) }}</span>
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
        <div class="action-item comment" @click.stop="app.createPost({ancestor: note.id})">
          <BaseIcon icon="comment" />
          <span>{{ stats.comments || '' }}</span>
        </div>
        <div class="action-item repost" @click.stop>
          <BaseIcon icon="repost" />
          <span>{{ stats.shares || '' }}</span>
        </div>
        <div class="action-item like" @click.stop>
          <BaseIcon icon="like" />
          <span>{{ stats.reactions || '' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import PostRenderer from 'components/Post/Renderer/PostRenderer.vue'
import {useAppStore} from 'stores/App'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useStatStore} from 'src/nostr/store/StatStore'
import routerMixin from 'src/router/mixin'
import DateUtils from 'src/utils/DateUtils'

export default {
  name: 'ListPost',
  mixins: [routerMixin],
  components: {
    UserAvatar,
    UserName,
    PostRenderer,
    BaseIcon,
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
      stat: useStatStore(),
    }
  },
  computed: {
    ancestor() {
      return this.note.hasAncestor()
        ? this.nostr.getNote(this.note.ancestor())
        : null
    },
    stats() {
      return this.stat.get(this.note.id)
    },
    showActions() {
      return this.actions && this.note.canReply()
    },
  },
  methods: {
    formatPostDate(timestamp) {
      const format = this.$q.screen.lt.md ? 'short' : 'long'
      return DateUtils.formatFromNow(timestamp, format)
    },
  },
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 450px;
      width: calc(100% + 9px);
      margin-left: -9px;
      .action-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        svg {
          padding: 8px;
          border-radius: 999px;
          display: block;
          width: 36px;
          height: 36px;
          fill: $color-light-gray;
        }
        span {
          color: $color-light-gray;
        }
        &:hover {
          &.comment {
            svg {
              fill: $post-action-blue;
              background-color: rgba($color: $post-action-blue, $alpha: 0.2);
            }
            span {
              color: $post-action-blue;
            }
          }
          &.repost {
            svg {
              fill: $post-action-green;
              background-color: rgba($color: $post-action-green, $alpha: 0.2);
            }
            span {
              color: $post-action-green;
            }
          }
          &.like {
            svg {
              fill: $post-action-red;
              background-color: rgba($color: $post-action-red, $alpha: 0.2);
            }
            span {
              color: $post-action-red;
            }
          }
        }
      }
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

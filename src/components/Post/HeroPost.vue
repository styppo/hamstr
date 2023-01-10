<template>
  <div class="post">
    <div class="post-author">
      <div class="post-author-avatar">
        <div class="connector-top">
          <div v-if="connector" class="connector-line"></div>
        </div>
        <UserAvatar :pubkey="note.author" clickable />
      </div>
      <div class="post-author-name">
        <UserName :pubkey="note.author" clickable two-line />
      </div>
    </div>
    <div class="post-content">
      <div class="post-content-header">
        <p v-if="note.isReply()" class="in-reply-to">
          Replying to
          <a @click.stop="goToProfile(ancestor?.author)">
            <UserName v-if="ancestor?.author" :pubkey="ancestor?.author" />
          </a>
        </p>
      </div>
      <div class="post-content-body">
        <p>
          <BaseMarkdown :content="note.content" />
        </p>
      </div>
      <div class="post-content-footer">
        <p class="created-at">
          <span>{{ formatTime(note.createdAt) }}</span>
          <span>&#183;</span>
          <span>{{ formatDate(note.createdAt) }}</span>
        </p>
        <div class="post-content-actions">
          <div class="action-item comment">
            <BaseIcon icon="comment" />
            <span>{{ stats.comments || '' }}</span>
          </div>
          <div class="action-item repost">
            <BaseIcon icon="repost" />
            <span>{{ stats.shares || '' }}</span>
          </div>
          <div class="action-item like">
            <BaseIcon icon="like" />
            <span>{{ stats.reactions || '' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="app.isSignedIn" class="post-reply">
      <PostEditor
        :ancestor="note"
        compact
        placeholder="Post your reply"
      />
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import BaseMarkdown from 'components/Post/BaseMarkdown.vue'
import PostEditor from 'components/CreatePost/PostEditor.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useAppStore} from 'stores/App'
import routerMixin from 'src/router/mixin'
import DateUtils from 'src/utils/DateUtils'

export default {
  name: 'HeroPost',
  mixins: [routerMixin],
  components: {
    BaseMarkdown,
    UserName,
    UserAvatar,
    BaseIcon,
    PostEditor,
  },
  props: {
    note: {
      type: Object,
      required: true
    },
    connector: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      app: useAppStore(),
      nostr: useNostrStore()
    }
  },
  computed: {
    ancestor() {
      return this.note.isReply()
        ? this.nostr.getNote(this.note.ancestor())
        : null
    },
    stats() {
      return {
        comments: 0,
        reactions: 0,
        shares: 0,
      }
    },
  },
  methods: {
    formatDate: DateUtils.formatDate,
    formatTime: DateUtils.formatTime,
  }
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.post {
  border-bottom: $border-dark;
  padding-bottom: 1rem;
  &-author {
    display: flex;
    flex-direction: row;
    padding: 0 1rem;
    &-name {
      margin-top: 1rem;
      margin-left: 12px;
    }
    .connector-top {
      height: 1rem;
      padding-bottom: 4px;
    }
    .connector-line {
      width: 2px;
      height: 100%;
      margin: auto;
      background: rgb(56, 68, 77);
    }
  }
  &-content {
    padding: 1rem;
    flex-grow: 1;
    max-width: 644px;
    &-header {
      p.in-reply-to {
        color: $color-dark-gray;
        margin: 0 0 8px;
        a {
          color: $color-primary;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    &-body {
      p {
        color: #fff;
        font-size: 1.6em;
        line-height: 1.3em;
      }
      p:last-child {
        margin-bottom: 0;
      }
    }
    &-footer {
      color: $color-dark-gray;
      border-bottom: $border-dark;
      p.created-at {
        margin: 0;
        padding: 1rem 0;
        border-bottom: $border-dark;
        span + span {
          margin-left: 8px;
        }
      }
    }
    &-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 450px;
      width: 100%;
      padding: .5rem 0;
      margin: auto;
      .action-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        svg {
          padding: 8px;
          border-radius: 999px;
          display: block;
          width: 40px;
          height: 40px;
          fill: $color-light-gray;
        }
        span {
          color: $color-light-gray;
          line-height: 40px;
          font-weight: bold;
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
  .post{
    &-content {
      &-header {
        span{
          display: none;
        }
        .created-at {
          display: block;
          color: rgba($color: $color-dark-gray, $alpha: 0.5);
          margin: 5px 0;
        }
        .nip05 {
          display: unset;
          color: $color-dark-gray;
        }
      }
      &-actions {
        max-width: unset;
      }
    }
  }
}
</style>

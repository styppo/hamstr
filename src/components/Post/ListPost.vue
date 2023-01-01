<template>
  <div
    class="post"
    :class="{clickable}"
    @click.stop="clickable && toEvent(post.id)"
  >
    <div class="post-author">
      <div class="connector-top">
        <div v-if="connectorTop" class="connector-line"></div>
      </div>
      <BaseUserAvatar :pubkey="post.author" @click.stop />
      <div class="connector-bottom">
        <div v-if="connectorBottom" class="connector-line"></div>
      </div>
    </div>
    <div class="post-content">
      <div class="post-content-header">
        <p>
          <BaseUserName :pubkey="post.author" @click.stop />
          <span>&#183;</span>
          <span class="created-at">{{ formatPostDate(post.createdAt) }}</span>
        </p>
        <p v-if="ancestor" class="in-reply-to">
          Replying to <a @click.stop="toEvent(ancestor)">{{ shorten(ancestor) }}</a>
        </p>
      </div>
      <div class="post-content-body">
        <BaseMarkdown :content="post.content" />
      </div>
      <div v-if="actions" class="post-content-actions">
        <div class="action-item comment" @click.stop="$store.dispatch('createPost', {replyTo})">
          <BaseIcon icon="comment" />
          <span>{{ numComments }}</span>
        </div>
        <div class="action-item repost" @click.stop>
          <BaseIcon icon="repost" />
          <span>{{ post.stats.reposts }}</span>
        </div>
        <div class="action-item like" @click.stop>
          <BaseIcon icon="like" />
          <span>{{ post.stats.likes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon'
import BaseUserAvatar from 'components/BaseUserAvatar.vue'
import BaseUserName from 'components/BaseUserName.vue'
import BaseMarkdown from 'components/BaseMarkdown.vue'
import helpersMixin from 'src/utils/mixin'
import moment from 'moment'

function countRepliesRecursive(event) {
  if (!event.replies) {
    return 0
  }
  let count = 0
  for (const thread of event.replies) {
    if (!thread || !thread.length) {
      continue
    }
    count += thread.length
    for (const reply of thread) {
      count += countRepliesRecursive(reply)
    }
  }
  return count
}

function postFromEvent(event) {
  return {
    id: event.id,
    author: event.pubkey,
    createdAt: event.created_at * 1000,
    content: event.interpolated.text,
    replyTo: event.interpolated.replyEvents,
    images: [],
    stats: {
      comments: '',
      reposts: '',
      likes: '',
    }
  }
}

export default {
  name: 'ListPost',
  mixins: [helpersMixin],
  components: {
    BaseMarkdown,
    BaseUserName,
    BaseUserAvatar,
    BaseIcon,
  },
  props: {
    event: {
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
  computed: {
    post() {
      return postFromEvent(this.event)
    },
    ancestor() {
      if (this.post.replyTo.length === 0) return
      return this.post.replyTo[this.post.replyTo.length - 1]
    },
    replyTo() {
      return this.post.replyTo.concat([this.post.id])
    },
    numComments() {
      return countRepliesRecursive(this.event)
    },
  },
  methods: {
    formatPostDate(timestamp) {
      return this.$q.screen.lt.md
        ? this.shortDateFromNow(timestamp)
        : moment(timestamp).fromNow()
    },
    shortDateFromNow(timestamp) {
      const now = Date.now()
      const diff = Math.round(Math.max(now - timestamp, 0) / 1000)
      const formatDiff = (div, offset) => Math.max(Math.floor((diff + offset) / div), 1)

      if (diff < 45) return `${formatDiff(1, 0)}s`
      if (diff < 60 * 45) return `${formatDiff(60, 15)}m`
      if (diff < 60 * 60 * 22) return `${formatDiff(60 * 60, 60 * 15)}h`
      if (diff < 60 * 60 * 24 * 26) return `${formatDiff(60 * 60 * 24, 60 * 60 * 2)}d`
      if (diff < 60 * 60 * 24 * 30 * 320) return `${formatDiff(60 * 60 * 24 * 30, 60 * 60 * 24 * 4)}mo`
      return `${formatDiff(60 * 60 * 24 * 30 * 365, 60 * 60 * 24 * 45)}y`
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'assets/theme/colors.scss';
@import 'assets/variables.scss';

.post {
  padding: 0 1rem;
  display: flex;
  transition: 100ms ease background-color;
  border-bottom: $border-dark;
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
      .in-reply-to {
        color: $color-dark-gray;
        a {
          color: $color-primary;
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
      margin-bottom: 1rem;
    }
    &-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 450px;
      width: 100%;
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
      &-header {
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

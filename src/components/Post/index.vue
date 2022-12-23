<template>
  <div
    class="post"
    @click.stop="toEvent(post.id)"
  >
    <div class="post-author">
      <base-user-avatar :pubkey="post.author" />
    </div>
    <div class="post-content">
      <div class="post-content-header">
        <p>
          <base-user-name :pubkey="post.author" />
          <span>&#183;</span>
          <span class="created-at">{{ moment(post.createdAt).fromNow() }}</span>
        </p>
      </div>
      <div
        class="post-content-body"
      >
        <p>
          <base-markdown :content="post.content" />
        </p>
        <div
          v-if="post.images.length > 0"
          class="post-content-body-images"
        >
          <div class="post-content-body-images-wrapper">
            <div
              v-for="(image, i) in post.images"
              :key="i"
              class="post-content-image-item"
            >
              <img
                :src="image.url"
                @click="$store.dispatch('setLightbox', imageUrls)"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="post-content-actions">
        <div class="action-item comment">
          <base-icon icon="comment" />
          <span>{{ post.stats.comments }}</span>
        </div>
        <div class="action-item repost">
          <base-icon icon="repost" />
          <span>{{ post.stats.reposts }}</span>
        </div>
        <div class="action-item like">
          <base-icon icon="like" />
          <span>{{ post.stats.likes }}</span>
        </div>
        <div class="action-item comment">
          <base-icon icon="share" />
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
  let count = event.replies.length
  for (const reply of event.replies) {
    count += countRepliesRecursive(reply)
  }
  return count
}

function postFromEvents(events) {
  const event = events[0]
  if (event.replies.length) {
    console.log(event)
  }
  return {
    id: event.id,
    author: event.pubkey,
    createdAt: event.created_at * 1000,
    content: event.content,
    images: [],
    stats: {
      comments: countRepliesRecursive(event),
      reposts: 11,
      likes: 52,
    }
  }
}

export default {
  name: 'Post',
  mixins: [helpersMixin],
  components: {
    BaseMarkdown,
    BaseUserName,
    BaseUserAvatar,
    BaseIcon,
  },
  props: {
    events: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      post: postFromEvents(this.events),
    }
  },
  computed: {
    imageUrls() {
      return this.post.images.map(image => image.url)
    }
  },
  methods: {
    moment,
  }
}
</script>

<style lang="scss">
@import 'assets/theme/colors.scss';
@import 'assets/variables.scss';

.post {
  padding: 1rem;
  display: flex;
  transition: 100ms ease background-color;
  cursor: pointer;
  border-bottom: $border-dark;

  &:hover {
    background-color: rgba($color: $color-dark-gray, $alpha: 0.2);
  }
  &-author {
    img {
      width: 100%;
      border-radius: 999px;
    }
  }
  &-content {
    margin-left: 10px;
    flex-grow: 1;
    &-header {
      p {
        margin: 8px 0;
        font-weight: bold;
        color: #fff;
        > span {
          color: $color-dark-gray;
          & + span {
            margin-left: 8px;
          }
          &.nip05 {
          }
          &.created-at {
            font-weight: normal;
          }
        }
      }
    }
    &-body {
      color: #fff;
      &-images {
        &-wrapper {
          border-radius: 10px;
          overflow: hidden;
          border: $border-light;
          display: flex;
          .post-content-image-item {
            cursor: zoom-in;
            & + .post-content-image-item {
              border-left: $border-light;
            }
            flex-grow: 1;
            img {
              vertical-align: middle;
              width: 100%;
            }
          }
        }
      }
    }
    &-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 450px;
      width: 100%;
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

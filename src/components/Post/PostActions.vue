<template>
  <div class="post-actions" :class="flavor">
    <div class="action-item comment" @click.stop="comment">
      <BaseIcon icon="comment" />
      <span>{{ stats.comments || '' }}</span>
    </div>
    <div class="action-item repost" @click.stop="repost">
      <BaseIcon icon="repost" />
      <span>{{ stats.shares || '' }}</span>
    </div>
    <div class="action-item like" :class="{active: liked}" @click.stop="like">
      <BaseIcon :icon="liked ? 'like_filled' : 'like'" />
      <span>{{ stats.reactions || '' }}</span>
    </div>
  </div>
</template>

<script>
import BaseIcon from 'components/BaseIcon/index.vue'
import {useNostrStore} from 'src/nostr/NostrStore'
import {useStatStore} from 'src/nostr/store/StatStore'
import {useAppStore} from 'stores/App'
import EventBuilder from 'src/nostr/EventBuilder'

export default {
  name: 'PostActions',
  components: {BaseIcon},
  emits: ['comment', 'repost'],
  props: {
    note: {
      type: Object,
      required: true,
    },
    flavor: {
      type: String,
      default: 'list',
    }
  },
  setup() {
    return {
      app: useAppStore(),
      stat: useStatStore(),
      nostr: useNostrStore()
    }
  },
  computed: {
    stats() {
      return this.stat.get(this.note.id)
    },
    ourReactions() {
      return this.nostr.getOurReactionsTo(this.note.id)
    },
    liked() {
      return this.ourReactions.length > 0
    },
  },
  methods: {
    comment() {
      if (this.flavor === 'list') {
        this.app.createPost({ancestor: this.note.id})
      } else {
        this.$emit('comment')
      }
    },
    repost() {
      if (this.flavor === 'list') {
        // TODO
        //this.app.createPost({ancestor: this.note.id})
      } else {
        this.$emit('repost')
      }
    },
    like() {
      return !this.liked ? this.publishLike() : this.deleteLike()
    },
    async publishLike() {
      const event = EventBuilder.reaction(this.note, this.app.myPubkey).build()
      if (!await this.app.signEvent(event)) return
      if (!await this.nostr.publish(event)) {
        this.$q.notify({
          message: 'Failed to publish reaction',
          color: 'negative',
        })
      }
    },
    async deleteLike() {
      const ids = this.ourReactions.map(r => r.id)
      const event = EventBuilder.delete(this.app.myPubkey, ids).build()
      if (!await this.app.signEvent(event)) return
      if (!await this.nostr.publish(event)) {
        this.$q.notify({
          message: 'Failed to delete reaction',
          color: 'negative',
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";
@import "assets/variables.scss";

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 490px;
  width: 100%;
  margin: auto;
  padding: .5rem 0 .5rem 16px;
  &.list {
    width: calc(100% + 9px);
    margin-left: -9px;
    padding: 0;
    .action-item {
      min-width: 56px;
      svg {
        width: 36px;
        height: 36px;
      }
    }
  }
  .action-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    min-width: 60px;
    transition: 120ms ease;
    svg {
      padding: 8px;
      border-radius: 999px;
      display: block;
      width: 40px;
      height: 40px;
      fill: $color-light-gray;
      transition: 120ms ease;
    }
    span {
      color: $color-light-gray;
    }
    &.active, &:hover {
      &.comment {
        svg {
          fill: $post-action-blue;
        }
        span {
          color: $post-action-blue;
        }
      }
      &.repost {
        svg {
          fill: $post-action-green;
        }
        span {
          color: $post-action-green;
        }
      }
      &.like {
        svg {
          fill: $post-action-red;
        }
        span {
          color: $post-action-red;
        }
      }
    }
    &:hover {
      &.comment {
        svg {
          background-color: rgba($color: $post-action-blue, $alpha: 0.2);
        }
      }
      &.repost {
        svg {
          background-color: rgba($color: $post-action-green, $alpha: 0.2);
        }
      }
      &.like {
        svg {
          background-color: rgba($color: $post-action-red, $alpha: 0.2);
        }
      }
    }
  }
}

@media screen and (max-width: $phone) {
  .post-actions {
    max-width: unset;
  }
}
</style>

<template>
  <div class="user-card">
    <UserAvatar :pubkey="pubkey" :clickable="clickable" />
    <UserName :pubkey="pubkey" :clickable="clickable" class="username" two-line show-verified />
    <FollowButton v-if="followButton" :pubkey="pubkey" />
  </div>
</template>

<script>
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'
import FollowButton from 'components/User/FollowButton.vue'

export default {
  name: 'UserCard',
  components: {FollowButton, UserName, UserAvatar},
  props: {
    pubkey: {
      type: String,
      required: true,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    followButton: {
      type: Boolean,
      default: false,
    }
  }
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  margin: 1rem;
  * + * {
    margin-left: 1rem;
  }
  .username {
    flex-grow: 1;
  }
}
</style>

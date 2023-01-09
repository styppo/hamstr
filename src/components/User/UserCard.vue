<template>
  <div class="user-card">
    <UserAvatar :pubkey="pubkey" :clickable="clickable" />
    <UserName :pubkey="pubkey" :clickable="clickable" two-line />
  </div>
</template>

<script>
import UserAvatar from 'components/User/UserAvatar.vue'
import UserName from 'components/User/UserName.vue'

export default {
  name: 'UserCard',
  components: {UserName, UserAvatar},
  props: {
    pubkey: {
      type: String,
      required: true,
    },
    clickable: {
      type: Boolean,
      default: false,
    }
  }
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  margin: 1rem;
  * + * {
    margin-left: 1rem;
  }
}
</style>

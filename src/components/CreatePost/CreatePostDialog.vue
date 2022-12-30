<template>
  <q-dialog v-model="$store.state.postDialogOpen">
    <PostEditor />
  </q-dialog>
</template>

<script>
import PostEditor from 'components/CreatePost/PostEditor.vue'

export default {
  name: 'CreatePostDialog',
  components: {
    PostEditor
  }
}
</script>

<style scoped>

</style>

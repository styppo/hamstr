<template>
  <div v-if="!count" class="list-placeholder">
    <q-spinner v-if="loading" size="sm" />
    <p v-else>Nothing here</p>
  </div>
</template>

<script>
export default {
  name: 'ListPlaceholder',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    }
  }
}
</script>

<style lang="scss" scoped>
.list-placeholder {
  padding: 1rem;
  text-align: center;
}
</style>

<template>
  <div v-if="!count" class="list-placeholder">
    <q-spinner v-if="loading" size="sm" />
    <p v-else>{{ label }}</p>
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
    },
    label: {
      type: String,
      default: 'Nothing here',
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

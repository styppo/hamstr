<template>
  <div class="load-more">
    <q-btn
      flat
      size="md"
      :loading="loading"
      color="accent"
      style="letter-spacing: .1rem;"
      :label="reachedEnd ? 'reached end' : label"
      :disable="reachedEnd"
      @click="$emit('click')"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseButtonLoadMore',
  emits: ['click'],
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    reachedEnd: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'load more'
    }
  },
})
</script>

<style lang="scss" scoped>
.load-more button {
  width: 100%;
  padding: 1rem 0;
}
</style>

<template>
  <div class="load-more">
    <q-btn
      :loading="loading"
      :label="reachedEnd ? 'reached end' : label"
      :disable="reachedEnd"
      @click="$emit('click')"
      size="md"
      flat
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
      default: false,
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
  letter-spacing: 1px;
}
</style>

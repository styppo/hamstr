<template>
  <div ref="button" class="async-load-button">
    <q-btn
      :loading="loading"
      :label="noMore ? labelNoMore : label"
      @click="load"
      size="md"
      flat
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AsyncLoadButton',
  emits: ['loading', 'loaded'],
  props: {
    loadFn: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      default: 'Load more'
    },
    labelNoMore: {
      type: String,
      default: 'No more items. Try again?'
    },
    autoload: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      loading: false,
      noMore: false,
      observer: null,
    }
  },
  methods: {
    async load() {
      if (this.loading) return

      this.loading = true
      this.$emit('loading')

      const result = await this.loadFn()
      this.noMore = !result || !result.length

      this.loading = false
      this.$emit('loaded', result)
    }
  },
  mounted() {
    if (this.autoload) {
      this.observer = new IntersectionObserver(this.load.bind(this), {
        root: null,
        threshold: 0.5,
      })
      this.observer.observe(this.$refs.button)
    }
  },
  unmounted() {
    if (this.observer) this.observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.async-load-button button {
  width: 100%;
  padding: 1rem 0;
  letter-spacing: 1px;
}
</style>

<template>
  <div ref="link" class="async-load-link" @click="load">
    <q-spinner v-if="loading" size="sm" />
    <span v-else>
      {{ $t(noMore ? prefixNoMore : !hasItems ? prefix : "") }}
      <a>
        {{ $t(noMore ? labelNoMore : label) }}
      </a>
    </span>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AsyncLoadLink',
  emits: ['loading', 'loaded'],
  props: {
    loadFn: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      default: 'Load more',
    },
    labelNoMore: {
      type: String,
      default: 'Try again?',
    },
    prefix: {
      type: String,
      default: 'Nothing here.',
    },
    prefixNoMore: {
      type: String,
      default: 'Nothing found.',
    },
    hasItems: {
      type: Boolean,
      default: false,
    },
    autoload: {
      type: Boolean,
      default: false,
    },
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
    },
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
  },
})
</script>

<style lang="scss" scoped>
@import "assets/theme/colors.scss";

.async-load-link {
  width: 100%;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: 120ms ease;
  a {
    color: $color-primary;
  }
  &:hover {
    background: rgba($color: $color-dark-gray, $alpha: 0.2);
    a {
      text-decoration: underline;
    }
  }
}
</style>

<template>
  <textarea
    v-model="text"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="resize"
    @focus="resize"
    ref="textarea"
  ></textarea>
</template>

<script>
export default {
  name: 'AutoSizeTextarea',
  props: {
    modelValue: {
      type: [String, Number],
      required: true,
    },
    minHeight: {
      type: Number,
      default: null,
    },
    maxHeight: {
      type: Number,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'What\'s happening?',
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      text: this.modelValue,
    }
  },
  watch: {
    modelValue(value) {
      this.text = value
    },
    text(value) {
      this.$nextTick(this.resize)
      this.$emit('update:modelValue', value)
    },
  },
  methods: {
    resize() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea
        textarea.style.height = 'inherit'
        let height = textarea.scrollHeight

        if (this.minHeight) {
          height = Math.max(height, this.minHeight)
        }
        if (this.maxHeight) {
          height = Math.min(height, this.maxHeight)
        }
        textarea.style.height = height + 'px'
      })
    },
    insertText(text) {
      const textarea = this.$refs.textarea
      textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd)

      textarea.focus()
      if (textarea.selectionStart === textarea.selectionEnd) {
        const caretPos = textarea.selectionStart + text.length
        textarea.setSelectionRange(caretPos, caretPos)
      }
      this.$emit('update:modelValue', textarea.value)
    },
    focus() {
      this.$refs.textarea.focus()
    },
  },
  mounted() {
    if (this.text) {
      this.resize()
    }
  }
}
</script>

<style scoped>

</style>

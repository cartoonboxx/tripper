<script lang="ts">
import style from './InputBase.module.scss'
import { defineComponent, type StyleValue } from 'vue'
import { createId } from '@/utils/createId'
import { componentProps } from './Input.props'

export default defineComponent({
  name: 'InputBase',
  inheritAttrs: false,
  props: componentProps,
  computed: {
    rootStyle(): StyleValue {
      return this.$attrs.style as StyleValue
    },
    hasLabel(): boolean {
      return Boolean(this.label?.trim())
    },
    controlId(): string | undefined {
      if (this.$attrs.id) return String(this.$attrs.id)
      return this.hasLabel ? this.id : undefined
    },
    controlAttrs() {
      return Object.fromEntries(
        Object.entries(this.$attrs).filter(([key]) => !['class', 'style', 'id'].includes(key)),
      )
    },
  },
  emits: ['update:modelValue'],
  data() {
    return { style, id: createId(), resizeObserver: null as ResizeObserver | null }
  },
  mounted() {
    this.resizeTextarea()
    if (typeof ResizeObserver !== 'undefined') {
      let width = 0
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (entry && entry.contentRect.width !== width) {
          width = entry.contentRect.width
          this.resizeTextarea()
        }
      })
      this.resizeObserver.observe(this.$el)
    }
  },
  updated() {
    this.resizeTextarea()
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect()
  },
  methods: {
    resizeTextarea() {
      const field = this.$refs.control
      if (!(field instanceof HTMLTextAreaElement) || !field.clientWidth) return
      field.style.height = '0px'
      const minimum = parseFloat(getComputedStyle(field).lineHeight) * this.rows
      field.style.height = `${Math.max(field.scrollHeight, minimum)}px`
    },
    onInput(event: Event) {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement
      this.resizeTextarea()
      this.$emit('update:modelValue', field.value)
    },
  },
})
</script>
<template>
  <div
    :class="[
      style.uiField,
      size === 'sm' && style.uiFieldSm,
      size === 'lg' && style.uiFieldLg,
      appearance.uiField,
      $attrs.class,
    ]"
    :style="rootStyle">
    <label
      v-if="hasLabel"
      :for="controlId">
      {{ label }}
      <span v-if="required">*</span>
    </label>
    <div
      :class="[
        style.uiInputWrap,
        type === 'textarea' && style.multiline,
        appearance.uiInputWrap,
        error && appearance.invalid,
        disabled && appearance.disabled,
      ]">
      <slot name="prefix" />
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        ref="control"
        v-bind="controlAttrs"
        :id="controlId"
        :value="modelValue"
        :type="type === 'textarea' ? undefined : type"
        :rows="type === 'textarea' ? rows : undefined"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :autocomplete="autocomplete"
        @input="onInput" />
      <slot name="suffix" />
    </div>
    <small
      v-if="error"
      :class="[style.uiFieldError, appearance.uiFieldError]">
      {{ error }}
    </small>
  </div>
</template>

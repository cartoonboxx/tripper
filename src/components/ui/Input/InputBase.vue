<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
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
      return this.$attrs.id ? String(this.$attrs.id) : this.hasLabel ? this.id : undefined
    },
    controlAttrs() {
      return Object.fromEntries(
        Object.entries(this.$attrs).filter(([key]) => !['class', 'style', 'id'].includes(key)),
      )
    },
  },
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style), id: createId() }
  },
})
</script>
<template>
  <div
    :class="[style.uiField, appearance.uiField, $attrs.class]"
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
        appearance.uiInputWrap,
        error && appearance.invalid,
        disabled && appearance.disabled,
      ]">
      <slot name="prefix" />
      <input
        v-bind="controlAttrs"
        :id="controlId"
        :value="modelValue"
        :type="type || 'text'"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <slot name="suffix" />
    </div>
    <small
      v-if="error"
      :class="[style.uiFieldError, appearance.uiFieldError]">
      {{ error }}
    </small>
  </div>
</template>

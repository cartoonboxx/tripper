<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SelectBase.module.scss'
import { defineComponent, type StyleValue } from 'vue'
import { createId } from '@/utils/createId'
import { componentProps } from './Select.props'

export default defineComponent({
  name: 'SelectBase',
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
    </label>
    <select
      v-bind="controlAttrs"
      :id="controlId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

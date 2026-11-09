<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './CheckboxBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Checkbox.props'

export default defineComponent({
  name: 'CheckboxBase',
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <label :class="[style.uiCheckbox, appearance.uiCheckbox]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    <span v-if="label || $slots.default">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

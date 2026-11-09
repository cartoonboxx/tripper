<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SwitchBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Switch.props'

export default defineComponent({
  name: 'SwitchBase',
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <label
    :class="[style.uiSwitch, appearance.uiSwitch, { [style.isActive || '']: modelValue }]"
    :title="label">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    <span :class="[style.thumb, appearance.thumb]" />
    <span :class="style.label">{{ label }}</span>
  </label>
</template>

<template>
  <label :class="[style.uiSwitch, appearance.uiSwitch, modelValue && style.isActive]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    <span :class="[style.thumb, appearance.thumb]" />
    <span :class="style.label">{{ label }}</span>
  </label>
</template>
<script lang="ts">
import style from './SwitchBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Switch.props'

export default defineComponent({
  name: 'SwitchBase',
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>

<script lang="ts">
import InputBase from './InputBase.vue'
import style from './InputStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Input.props'

export default defineComponent({
  name: 'Input',
  components: { InputBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>
<template>
  <InputBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style">
    <template
      v-if="$slots.prefix"
      #prefix>
      <slot name="prefix" />
    </template>
    <template
      v-if="$slots.suffix"
      #suffix>
      <slot name="suffix" />
    </template>
  </InputBase>
</template>

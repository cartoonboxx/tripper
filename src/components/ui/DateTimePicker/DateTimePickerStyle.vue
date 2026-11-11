<template>
  <DateTimePickerBase
    v-bind="$props"
    :appearance="style"
    @update:model-value="$emit('update:modelValue', $event)">
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
  </DateTimePickerBase>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import DateTimePickerBase from './DateTimePickerBase.vue'
import { componentProps } from './DateTimePicker.props'
import style from './DateTimePickerStyle.module.scss'

export default defineComponent({
  name: 'DateTimePicker',
  components: { DateTimePickerBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>

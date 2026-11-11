<template>
  <SelectBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style" />
</template>
<script lang="ts">
import SelectBase from './SelectBase.vue'
import style from './SelectStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Select.props'

export default defineComponent({
  name: 'Select',
  components: { SelectBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>

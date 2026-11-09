<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import SelectBase from './SelectBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SelectStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Select.props'

export default defineComponent({
  name: 'Select',
  inheritAttrs: false,
  components: { SelectBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <SelectBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="{ ...$props, ...$attrs }"
    :appearance="style">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </SelectBase>
</template>

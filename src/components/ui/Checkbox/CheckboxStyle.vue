<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import CheckboxBase from './CheckboxBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './CheckboxStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Checkbox.props'

export default defineComponent({
  name: 'Checkbox',
  components: { CheckboxBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <CheckboxBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </CheckboxBase>
</template>

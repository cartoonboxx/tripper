<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import InputBase from './InputBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './InputStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Input.props'

export default defineComponent({
  name: 'Input',
  inheritAttrs: false,
  components: { InputBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <InputBase
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
  </InputBase>
</template>

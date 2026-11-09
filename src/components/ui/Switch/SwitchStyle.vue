<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import SwitchBase from './SwitchBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './SwitchStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Switch.props'

export default defineComponent({
  name: 'Switch',
  components: { SwitchBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <SwitchBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style"
    :class="[modelValue && style.isActive]">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </SwitchBase>
</template>

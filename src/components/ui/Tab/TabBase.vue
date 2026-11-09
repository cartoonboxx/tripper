<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TabBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Tab.props'

export default defineComponent({
  name: 'TabBase',
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <button
    type="button"
    :class="[style.uiTab, appearance.uiTab, { [style.isActive || '']: active }]"
    :disabled="disabled">
    <slot />
  </button>
</template>

<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './CardBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Card.props'

export default defineComponent({
  name: 'CardBase',
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <div :class="[style.uiCard, appearance.uiCard, { [style.uiCardInteractive || '']: interactive }]">
    <slot />
  </div>
</template>

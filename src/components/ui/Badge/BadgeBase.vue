<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './BadgeBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Badge.props'

export default defineComponent({
  name: 'BadgeBase',
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <span :class="[style.uiBadge, appearance.uiBadge]">
    <slot />
  </span>
</template>

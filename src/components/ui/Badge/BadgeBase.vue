<script lang="ts">
import style from './BadgeBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Badge.props'

export default defineComponent({
  name: 'BadgeBase',
  props: componentProps,
  data() {
    return { style }
  },
})
</script>
<template>
  <span :class="[style.uiBadge, appearance.uiBadge]">
    <slot />
  </span>
</template>

<script lang="ts">
import BadgeBase from './BadgeBase.vue'
import style from './BadgeStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Badge.props'

const variants = {
  green: style.uiBadgeGreen,
  neutral: style.uiBadgeNeutral,
  orange: style.uiBadgeOrange,
}

export default defineComponent({
  name: 'Badge',
  components: { BadgeBase },
  props: componentProps,
  computed: {
    appearanceClass() {
      return variants[this.variant]
    },
  },
  data() {
    return { style }
  },
})
</script>
<template>
  <BadgeBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClass">
    <slot />
  </BadgeBase>
</template>

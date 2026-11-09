<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import BadgeBase from './BadgeBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './BadgeStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Badge.props'

export default defineComponent({
  name: 'Badge',
  components: { BadgeBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      const variants = {
        green: style.uiBadgeGreen,
        neutral: style.uiBadgeNeutral,
        orange: style.uiBadgeOrange,
      }
      return [variants[this.variant || 'green']]
    },
  },
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <BadgeBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClasses">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </BadgeBase>
</template>

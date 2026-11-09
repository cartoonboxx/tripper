<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import TabBase from './TabBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TabStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Tab.props'

export default defineComponent({
  name: 'Tab',
  components: { TabBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      const variants = {
        pill: style.uiTabPill,
        line: style.uiTabLine,
        vertical: style.uiTabVertical,
      }
      return [variants[this.variant || 'pill'], this.active && style.isActive]
    },
  },
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <TabBase
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
  </TabBase>
</template>

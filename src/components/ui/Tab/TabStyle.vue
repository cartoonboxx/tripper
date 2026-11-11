<template>
  <TabBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClasses">
    <slot />
  </TabBase>
</template>
<script lang="ts">
import TabBase from './TabBase.vue'
import style from './TabStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Tab.props'

const variants = {
  pill: style.uiTabPill,
  line: style.uiTabLine,
  vertical: style.uiTabVertical,
}

export default defineComponent({
  name: 'Tab',
  components: { TabBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      return [variants[this.variant], this.active && style.isActive]
    },
  },
  data() {
    return { style }
  },
})
</script>

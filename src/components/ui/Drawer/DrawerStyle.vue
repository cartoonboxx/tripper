<template>
  <DrawerBase
    @close="$emit('close')"
    v-bind="$props"
    :appearance="style">
    <slot />
    <template
      v-if="$slots.footer"
      #footer>
      <slot name="footer" />
    </template>
  </DrawerBase>
</template>
<script lang="ts">
import DrawerBase from './DrawerBase.vue'
import style from './DrawerStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Drawer.props'

export default defineComponent({
  name: 'Drawer',
  components: { DrawerBase },
  props: componentProps,
  emits: ['close'],
  data() {
    return { style }
  },
})
</script>

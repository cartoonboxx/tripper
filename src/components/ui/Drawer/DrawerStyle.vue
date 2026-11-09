<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import DrawerBase from './DrawerBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './DrawerStyle.module.scss'
import modalStyle from '../Modal/ModalStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Drawer.props'

export default defineComponent({
  name: 'Drawer',
  components: { DrawerBase },
  props: componentProps,
  emits: ['close'],
  data() {
    return { style: mergeStyles(sharedStyle, modalStyle, style) }
  },
})
</script>
<template>
  <DrawerBase
    @close="$emit('close')"
    v-bind="$props"
    :appearance="style">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </DrawerBase>
</template>

<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import ModalBase from './ModalBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ModalStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Modal.props'

export default defineComponent({
  name: 'Modal',
  components: { ModalBase },
  props: componentProps,
  emits: ['close'],
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <ModalBase
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
  </ModalBase>
</template>

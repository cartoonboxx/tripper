<template>
  <ModalBase
    @close="$emit('close')"
    v-bind="$props"
    :appearance="style">
    <slot />
  </ModalBase>
</template>
<script lang="ts">
import ModalBase from './ModalBase.vue'
import style from './ModalStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Modal.props'

export default defineComponent({
  name: 'Modal',
  components: { ModalBase },
  props: componentProps,
  emits: ['close'],
  data() {
    return { style }
  },
})
</script>

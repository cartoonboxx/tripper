<template>
  <FloatingPopupBase
    v-bind="$props"
    :appearance="style"
    @update:open="$emit('update:open', $event)"
    @close="$emit('close')">
    <template
      v-if="$slots.target"
      #target="scope">
      <slot
        name="target"
        v-bind="scope" />
    </template>
    <template
      v-if="$slots.trigger"
      #trigger="scope">
      <slot
        name="trigger"
        v-bind="scope" />
    </template>
    <template #default="scope">
      <slot v-bind="scope" />
    </template>
  </FloatingPopupBase>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import FloatingPopupBase from './FloatingPopupBase.vue'
import { componentProps } from './FloatingPopup.props'
import style from './FloatingPopupStyle.module.scss'

export default defineComponent({
  name: 'FloatingPopup',
  components: { FloatingPopupBase },
  props: componentProps,
  emits: ['update:open', 'close'],
  data() {
    return { style }
  },
})
</script>

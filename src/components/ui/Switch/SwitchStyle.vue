<script lang="ts">
import SwitchBase from './SwitchBase.vue'
import style from './SwitchStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Switch.props'

export default defineComponent({
  name: 'Switch',
  components: { SwitchBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>
<template>
  <SwitchBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style"
    :class="[modelValue && style.isActive]" />
</template>

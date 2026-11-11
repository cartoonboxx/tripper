<template>
  <button
    type="button"
    :class="[style.uiTab, appearance.uiTab, active && style.isActive]"
    :disabled="disabled">
    <slot />
  </button>
</template>
<script lang="ts">
import style from './TabBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Tab.props'

export default defineComponent({
  name: 'TabBase',
  props: componentProps,
  data() {
    return { style }
  },
})
</script>

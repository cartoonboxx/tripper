<script lang="ts">
import style from './CardBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Card.props'

export default defineComponent({
  name: 'CardBase',
  props: componentProps,
  data() {
    return { style }
  },
})
</script>
<template>
  <div :class="[style.uiCard, appearance.uiCard, interactive && style.uiCardInteractive]">
    <slot />
  </div>
</template>

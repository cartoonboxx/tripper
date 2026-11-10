<script lang="ts">
import CardBase from './CardBase.vue'
import style from './CardStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Card.props'

export default defineComponent({
  name: 'Card',
  components: { CardBase },
  props: componentProps,
  data() {
    return { style }
  },
})
</script>
<template>
  <CardBase
    v-bind="$props"
    :appearance="style"
    :class="[interactive && style.uiCardInteractive]">
    <slot />
  </CardBase>
</template>

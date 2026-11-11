<template>
  <ButtonBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClasses">
    <slot />
  </ButtonBase>
</template>
<script lang="ts">
import ButtonBase from './ButtonBase.vue'
import style from './ButtonStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Button.props'

const variants = {
  primary: style.uiButtonPrimary,
  secondary: style.uiButtonSecondary,
  ghost: style.uiButtonGhost,
  danger: style.uiButtonDanger,
}

const sizes = { sm: style.uiButtonSm, md: style.uiButton, lg: style.uiButtonLg }

export default defineComponent({
  name: 'Button',
  components: { ButtonBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      return [variants[this.variant], sizes[this.size]]
    },
  },
  data() {
    return { style }
  },
})
</script>

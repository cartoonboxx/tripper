<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import ButtonBase from './ButtonBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ButtonStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Button.props'

export default defineComponent({
  name: 'Button',
  components: { ButtonBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      const variants = {
        primary: style.uiButtonPrimary,
        secondary: style.uiButtonSecondary,
        ghost: style.uiButtonGhost,
        danger: style.uiButtonDanger,
      }
      const sizes = { sm: style.uiButtonSm, md: style.uiButton, lg: style.uiButtonLg }
      return [variants[this.variant || 'primary'], sizes[this.size || 'md']]
    },
  },
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <ButtonBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClasses">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </ButtonBase>
</template>

<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ButtonBase.module.scss'
import { defineComponent, markRaw } from 'vue'
import RouterLink from '@/components/navigation/AppLink.vue'
import { componentProps } from './Button.props'

export default defineComponent({
  name: 'ButtonBase',
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style), RouterLink: markRaw(RouterLink) }
  },
})
</script>
<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :class="[style.uiButton, appearance.uiButton, { [style.uiButtonIcon || '']: iconOnly }]"
    :type="to ? undefined : type || 'button'"
    :disabled="disabled">
    <slot />
  </component>
</template>

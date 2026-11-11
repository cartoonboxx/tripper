<template>
  <component
    :is="to ? 'AppLink' : 'button'"
    :to="to"
    :class="[style.uiButton, appearance.uiButton, iconOnly && style.uiButtonIcon]"
    :type="to ? undefined : type"
    :disabled="disabled">
    <slot />
  </component>
</template>
<script lang="ts">
import style from './ButtonBase.module.scss'
import { defineComponent } from 'vue'
import AppLink from '@/components/navigation/AppLink.vue'
import { componentProps } from './Button.props'

export default defineComponent({
  name: 'ButtonBase',
  components: { AppLink },
  props: componentProps,
  data() {
    return { style }
  },
})
</script>

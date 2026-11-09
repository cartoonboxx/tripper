<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import CardBase from './CardBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './CardStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Card.props'

export default defineComponent({
  name: 'Card',
  components: { CardBase },
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <CardBase
    v-bind="$props"
    :appearance="style"
    :class="[interactive && style.uiCardInteractive]">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </CardBase>
</template>

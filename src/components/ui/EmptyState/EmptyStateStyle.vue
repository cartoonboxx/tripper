<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import EmptyStateBase from './EmptyStateBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './EmptyStateStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './EmptyState.props'

export default defineComponent({
  name: 'EmptyState',
  components: { EmptyStateBase },
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <EmptyStateBase
    v-bind="$props"
    :appearance="style">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </EmptyStateBase>
</template>

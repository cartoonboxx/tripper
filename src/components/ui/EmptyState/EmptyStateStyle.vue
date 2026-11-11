<template>
  <EmptyStateBase
    v-bind="$props"
    :appearance="style">
    <slot />
  </EmptyStateBase>
</template>
<script lang="ts">
import EmptyStateBase from './EmptyStateBase.vue'
import style from './EmptyStateStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './EmptyState.props'

export default defineComponent({
  name: 'EmptyState',
  components: { EmptyStateBase },
  props: componentProps,
  data() {
    return { style }
  },
})
</script>

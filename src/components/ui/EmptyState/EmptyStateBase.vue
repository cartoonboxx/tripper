<template>
  <div :class="[style.uiEmpty, appearance.uiEmpty]">
    <span :class="[style.uiEmptyIcon, appearance.uiEmptyIcon]">
      <component
        :is="icon || PhCompass"
        :size="32" />
    </span>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>
<script lang="ts">
import style from './EmptyStateBase.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhCompass } from '@phosphor-icons/vue'
import { componentProps } from './EmptyState.props'

export default defineComponent({
  name: 'EmptyStateBase',
  props: componentProps,
  data() {
    return { style, PhCompass: markRaw(PhCompass) }
  },
})
</script>

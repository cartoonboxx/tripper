<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './EmptyStateBase.module.scss'
import { defineComponent } from 'vue'
import { PhCompass } from '@phosphor-icons/vue'
import { componentProps } from './EmptyState.props'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'EmptyStateBase',
  components: {},
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style), PhCompass: markRawValue(PhCompass) }
  },
})
</script>
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

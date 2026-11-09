<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './AvatarBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Avatar.props'

export default defineComponent({
  name: 'AvatarBase',
  props: componentProps,
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <span
    :style="{ background: color }"
    :title="name"
    :class="[style.uiAvatar, appearance.uiAvatar]">
    {{
      name
        ?.split(' ')
        .map((v) => v[0])
        .slice(0, 2)
        .join('') || 'А'
    }}
  </span>
</template>

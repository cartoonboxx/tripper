<template>
  <span
    :style="{ background: color }"
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
<script lang="ts">
import style from './AvatarBase.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Avatar.props'

export default defineComponent({
  name: 'AvatarBase',
  props: componentProps,
  data() {
    return { style }
  },
})
</script>

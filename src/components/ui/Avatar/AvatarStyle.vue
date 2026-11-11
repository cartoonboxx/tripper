<template>
  <AvatarBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClass" />
</template>
<script lang="ts">
import AvatarBase from './AvatarBase.vue'
import style from './AvatarStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Avatar.props'

const variants = { sm: style.uiAvatarSm, md: style.uiAvatar, lg: style.uiAvatarLg }

export default defineComponent({
  name: 'Avatar',
  components: { AvatarBase },
  props: componentProps,
  computed: {
    appearanceClass() {
      return variants[this.size]
    },
  },
  data() {
    return { style }
  },
})
</script>

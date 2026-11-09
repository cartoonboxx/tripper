<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import AvatarBase from './AvatarBase.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './AvatarStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Avatar.props'

export default defineComponent({
  name: 'Avatar',
  components: { AvatarBase },
  props: componentProps,
  computed: {
    appearanceClasses() {
      const variants = { sm: style.uiAvatarSm, md: style.uiAvatar, lg: style.uiAvatarLg }
      return [variants[this.size || 'md']]
    },
  },
  data() {
    return { style: mergeStyles(sharedStyle, style) }
  },
})
</script>
<template>
  <AvatarBase
    v-bind="$props"
    :appearance="style"
    :class="appearanceClasses">
    <template
      v-for="(_, name) in $slots"
      #[name]="scope">
      <slot
        :name="name"
        v-bind="scope || {}" />
    </template>
  </AvatarBase>
</template>

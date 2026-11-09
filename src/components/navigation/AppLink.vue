<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { RouterLink as NativeRouterLink, type RouteLocationRaw } from 'vue-router'
export default defineComponent({
  name: 'AppLink',
  components: { NativeRouterLink },
  inheritAttrs: false,
  props: {
    to: { type: [String, Object] as PropType<RouteLocationRaw>, required: true },
    activeClass: { type: String, default: '' },
    exactActiveClass: { type: String, default: '' },
    replace: Boolean,
  },
})
</script>
<template>
  <NativeRouterLink
    :to="to"
    :replace="replace"
    custom
    v-slot="{ href, navigate, isActive, isExactActive }">
    <a
      v-bind="$attrs"
      :href="href"
      :class="[isActive && activeClass, isExactActive && exactActiveClass]"
      @click="navigate">
      <slot />
    </a>
  </NativeRouterLink>
</template>

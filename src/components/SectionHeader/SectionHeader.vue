<template>
  <header :class="[style.sectionHeader, level === 'h1' && style.pageHeader]">
    <div :class="style.content">
      <component
        :is="level"
        :class="style.heading">
        {{ header }}
      </component>
      <p
        v-if="paragraph"
        :class="style.paragraph">
        {{ paragraph }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      :class="style.actions">
      <slot name="actions" />
    </div>
  </header>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import style from './SectionHeader.module.scss'

export default defineComponent({
  name: 'SectionHeader',
  props: {
    header: { type: String, required: true },
    paragraph: { type: String, default: '' },
    level: { type: String as PropType<'h1' | 'h2' | 'h3'>, default: 'h2' },
  },
  data() {
    return { style }
  },
})
</script>

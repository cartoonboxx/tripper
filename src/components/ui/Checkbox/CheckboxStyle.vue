<template>
  <CheckboxBase
    @update:model-value="$emit('update:modelValue', $event)"
    v-bind="$props"
    :appearance="style">
    <template
      v-if="$slots.default"
      #default>
      <slot />
    </template>
  </CheckboxBase>
</template>
<script lang="ts">
import CheckboxBase from './CheckboxBase.vue'
import style from './CheckboxStyle.module.scss'
import { defineComponent } from 'vue'
import { componentProps } from './Checkbox.props'

export default defineComponent({
  name: 'Checkbox',
  components: { CheckboxBase },
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    return { style }
  },
})
</script>

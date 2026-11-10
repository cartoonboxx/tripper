<script lang="ts">
import style from './SelectBase.module.scss'
import { defineComponent, type StyleValue } from 'vue'
import { createId } from '@/utils/createId'
import { componentProps } from './Select.props'
import { PhCaretDown } from '@phosphor-icons/vue'

export default defineComponent({
  name: 'SelectBase',
  components: { PhCaretDown },
  inheritAttrs: false,
  props: componentProps,
  computed: {
    rootStyle(): StyleValue {
      return this.$attrs.style as StyleValue
    },
    hasLabel(): boolean {
      return Boolean(this.label?.trim())
    },
    controlId(): string | undefined {
      if (this.$attrs.id) return String(this.$attrs.id)
      return this.hasLabel ? this.id : undefined
    },
    controlAttrs() {
      return Object.fromEntries(
        Object.entries(this.$attrs).filter(([key]) => !['class', 'style', 'id'].includes(key)),
      )
    },
  },
  emits: ['update:modelValue'],
  data() {
    return { style, id: createId() }
  },
})
</script>
<template>
  <div
    :class="[
      style.uiField,
      size === 'sm' && style.uiFieldSm,
      size === 'lg' && style.uiFieldLg,
      appearance.uiField,
      $attrs.class,
    ]"
    :style="rootStyle">
    <label
      v-if="hasLabel"
      :for="controlId">
      {{ label }}
    </label>
    <div :class="style.selectControl">
      <select
        v-bind="controlAttrs"
        :id="controlId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <PhCaretDown
        :size="16"
        :class="[style.caret, appearance.caret]" />
    </div>
  </div>
</template>

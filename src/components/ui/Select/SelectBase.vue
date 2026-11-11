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
    <FloatingPopup
      v-model:open="open"
      match-width>
      <template #trigger="{ toggle }">
        <div :class="style.selectControl">
          <select
            v-bind="controlAttrs"
            :id="controlId"
            :value="modelValue"
            :disabled="disabled"
            :required="required"
            @pointerdown.prevent="focusControl"
            @mousedown.prevent
            @click.prevent="toggle"
            @keydown="triggerKey($event, toggle)"
            @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
            <option
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled">
              {{ option.label }}
            </option>
          </select>
          <PhCaretDown
            :size="16"
            :class="[style.caret, appearance.caret, open && style.isOpen]" />
        </div>
      </template>
      <div
        ref="options"
        :class="style.options"
        @keydown="moveOption">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :disabled="option.disabled || disabled"
          :class="[
            style.option,
            appearance.option,
            option.value === modelValue && style.isSelected,
            option.value === modelValue && appearance.isSelected,
          ]"
          @click="choose(option.value)">
          <span>{{ option.label }}</span>
          <PhCheck
            v-if="option.value === modelValue"
            :size="18" />
        </button>
        <p
          v-if="!options.length"
          :class="style.empty">
          Нет вариантов
        </p>
      </div>
    </FloatingPopup>
  </div>
</template>
<script lang="ts">
import style from './SelectBase.module.scss'
import { defineComponent, type StyleValue } from 'vue'
import { createId } from '@/utils/createId'
import { componentProps } from './Select.props'
import FloatingPopup from '../FloatingPopup/FloatingPopupStyle.vue'
import { PhCaretDown, PhCheck } from '@phosphor-icons/vue'

export default defineComponent({
  name: 'SelectBase',
  components: { PhCaretDown, PhCheck, FloatingPopup },
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
  watch: {
    disabled(value: boolean) {
      if (value) this.open = false
    },
    async open(value: boolean) {
      if (!value) return
      await this.$nextTick()
      const list = this.$refs.options as HTMLElement | undefined
      const selected = list?.querySelector<HTMLButtonElement>(
        `button.${style.isSelected}:not(:disabled)`,
      )
      const first = list?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      const target = selected || first
      target?.focus({ preventScroll: true })
      selected?.scrollIntoView?.({ block: 'nearest' })
    },
  },
  methods: {
    focusControl(event: Event) {
      const control = event.currentTarget as HTMLSelectElement
      control.focus({ preventScroll: true })
    },
    triggerKey(event: KeyboardEvent, toggle: () => void) {
      if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return
      event.preventDefault()
      if (!this.disabled) toggle()
    },
    choose(value: string) {
      if (
        this.disabled ||
        !this.options.some((option) => option.value === value && !option.disabled)
      )
        return
      this.$emit('update:modelValue', value)
      this.open = false
    },
    moveOption(event: KeyboardEvent) {
      const list = this.$refs.options as HTMLElement
      const buttons = [...list.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
      let next = index
      if (event.key === 'ArrowDown') next = (index + 1) % buttons.length
      else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = buttons.length - 1
      else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey) {
        const ordered = [...buttons.slice(index + 1), ...buttons.slice(0, index + 1)]
        const match = ordered.find((button) =>
          button.textContent?.trim().toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()),
        )
        if (match) {
          event.preventDefault()
          match.focus()
        }
        return
      } else return
      event.preventDefault()
      buttons[next]?.focus()
    },
  },
  emits: ['update:modelValue'],
  data() {
    return { style, id: createId(), open: false }
  },
})
</script>

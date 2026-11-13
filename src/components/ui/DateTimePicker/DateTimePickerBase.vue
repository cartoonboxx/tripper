<template>
  <div
    :class="[
      fieldStyle.uiField,
      size === 'sm' && fieldStyle.uiFieldSm,
      size === 'lg' && fieldStyle.uiFieldLg,
      $attrs.class,
    ]"
    :style="rootStyle">
    <label
      v-if="label?.trim()"
      :for="controlId">
      {{ label }}
      <span v-if="required">*</span>
    </label>
    <FloatingPopup
      v-model:open="open"
      full-width>
      <template #trigger="{ toggle }">
        <div
          :class="[
            fieldStyle.uiInputWrap,
            style.control,
            appearance.control,
            error && appearance.invalid,
          ]"
          @pointerdown.prevent="focusControl"
          @mousedown.prevent
          @click.prevent="openPicker(toggle)">
          <slot name="prefix" />
          <input
            ref="control"
            v-bind="controlAttrs"
            :id="controlId"
            type="text"
            inputmode="numeric"
            :value="draft"
            :min="min"
            :max="max"
            :required="required"
            :disabled="disabled"
            :placeholder="placeholder || (isTime ? 'ЧЧ:ММ' : 'ДД.ММ.ГГГГ')"
            :autocomplete="autocomplete || 'off'"
            @keydown="triggerKey($event, toggle)"
            @input="onInput" />
          <button
            ref="trigger"
            type="button"
            :disabled="disabled || isReadonly"
            :class="style.iconButton">
            <component
              :is="isTime ? 'PhClock' : 'PhCalendarDots'"
              :size="20" />
          </button>
          <slot name="suffix" />
        </div>
      </template>
      <div
        ref="picker"
        :class="[style.picker, appearance.picker]">
        <template v-if="!isTime">
          <div :class="style.calendarHeader">
            <Button
              :disabled="!canPrevious"
              @click="changeMonth(-1)">
              <PhCaretLeft size="16" />
            </Button>
            <strong>{{ monthLabel }}</strong>
            <Button
              type="button"
              :disabled="!canNext"
              @click="changeMonth(1)">
              <PhCaretRight size="16" />
            </Button>
          </div>
          <table :class="style.calendar">
            <thead>
              <tr>
                <th
                  v-for="day in weekdays"
                  :key="day"
                  scope="col">
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(week, index) in weeks"
                :key="index">
                <td
                  v-for="day in week"
                  :key="day.value">
                  <button
                    type="button"
                    :value="day.value"
                    :disabled="!allowedDate(day.value)"
                    :class="[
                      style.day,
                      appearance.day,
                      day.outside && style.outside,
                      day.value === today && appearance.today,
                      day.value === modelValue && style.selected,
                      day.value === modelValue && appearance.selected,
                    ]"
                    @keydown="moveDate($event, day.value)"
                    @click="choose(day.value)">
                    {{ day.day }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div :class="style.footer">
            <button
              type="button"
              :disabled="!allowedDate(today)"
              @click="choose(today)">
              Сегодня
            </button>
            <button
              v-if="!required"
              type="button"
              @click="choose('')">
              Очистить
            </button>
          </div>
        </template>
        <template v-else>
          <strong :class="style.timeHeading">{{ timeValue }}</strong>
          <div :class="style.timeColumns">
            <fieldset>
              <legend>Часы</legend>
              <div
                :class="style.timeList"
                @keydown="moveTime">
                <button
                  v-for="value in hours"
                  :key="value"
                  type="button"
                  :disabled="!allowedHour(value)"
                  :class="[
                    style.timeOption,
                    hour === value && style.selected,
                    hour === value && appearance.selected,
                  ]"
                  @click="hour = value">
                  {{ value }}
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>Минуты</legend>
              <div
                :class="style.timeList"
                @keydown="moveTime">
                <button
                  v-for="value in minutes"
                  :key="value"
                  type="button"
                  :disabled="!allowedTime(`${hour}:${value}`)"
                  :class="[
                    style.timeOption,
                    minute === value && style.selected,
                    minute === value && appearance.selected,
                  ]"
                  @click="minute = value">
                  {{ value }}
                </button>
              </div>
            </fieldset>
          </div>
          <div :class="style.footer">
            <button
              v-if="!required"
              type="button"
              @click="choose('')">
              Очистить
            </button>
            <button
              type="button"
              :disabled="!validTime"
              :class="[style.confirm, appearance.confirm]"
              @click="choose(timeValue)">
              Готово
            </button>
          </div>
        </template>
      </div>
    </FloatingPopup>
    <small
      v-if="error"
      :class="[fieldStyle.uiFieldError, appearance.error]">
      {{ error }}
    </small>
  </div>
</template>
<script lang="ts">
import { defineComponent, type StyleValue } from 'vue'
import { PhCalendarDots, PhCaretLeft, PhCaretRight, PhClock } from '@phosphor-icons/vue'
import FloatingPopup from '../FloatingPopup/FloatingPopupStyle.vue'
import { componentProps } from './DateTimePicker.props'
import {
  dateValue,
  monthDays,
  parseDate,
  timeAllowed,
  parseDateInput,
  formatDateInput,
  parseTimeInput,
} from './DateTimePicker.calendar'
import { createId } from '@/utils/createId'
import fieldStyle from '../Input/InputBase.module.scss'
import style from './DateTimePickerBase.module.scss'
import Button from '@/components/ui/Button/ButtonStyle.vue'

export default defineComponent({
  name: 'DateTimePickerBase',
  components: { PhCaretRight, Button, PhCaretLeft, FloatingPopup, PhCalendarDots, PhClock },
  inheritAttrs: false,
  props: componentProps,
  emits: ['update:modelValue'],
  data() {
    const today = new Date()
    return {
      style,
      fieldStyle,
      id: createId('picker'),
      open: false,
      draft:
        this.type === 'time'
          ? String(this.modelValue || '')
          : formatDateInput(String(this.modelValue || '')),
      year: today.getFullYear(),
      month: today.getMonth(),
      hour: '10',
      minute: '00',
      weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      hours: Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')),
      minutes: Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')),
    }
  },
  computed: {
    isReadonly() {
      return this.$attrs.readonly !== undefined && this.$attrs.readonly !== false
    },
    isTime() {
      return this.type === 'time'
    },
    controlId(): string {
      return String(this.$attrs.id || this.id)
    },
    rootStyle(): StyleValue {
      return this.$attrs.style as StyleValue
    },
    controlAttrs() {
      return Object.fromEntries(
        Object.entries(this.$attrs).filter(([key]) => !['class', 'style', 'id'].includes(key)),
      )
    },
    minimum(): string {
      return String(this.min || '')
    },
    maximum(): string {
      return String(this.max || '')
    },
    today(): string {
      return dateValue(new Date())
    },
    monthLabel(): string {
      return new Date(this.year, this.month, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      })
    },
    weeks() {
      const days = monthDays(this.year, this.month)
      return Array.from({ length: 6 }, (_, week) => days.slice(week * 7, week * 7 + 7))
    },
    canPrevious(): boolean {
      return !this.minimum || dateValue(new Date(this.year, this.month, 0, 12)) >= this.minimum
    },
    canNext(): boolean {
      return !this.maximum || dateValue(new Date(this.year, this.month + 1, 1, 12)) <= this.maximum
    },
    timeValue(): string {
      return `${this.hour}:${this.minute}`
    },
    validTime(): boolean {
      return this.allowedTime(this.timeValue)
    },
  },
  mounted() {
    this.validate()
  },
  watch: {
    modelValue(value: string | number | undefined) {
      this.draft = this.isTime ? String(value || '') : formatDateInput(String(value || ''))
      this.validate()
    },
    min() {
      this.validate()
    },
    max() {
      this.validate()
    },
    disabled(value: boolean) {
      if (value) this.open = false
    },
    async open(value: boolean) {
      if (!value) return
      this.resetPicker()
      await this.$nextTick()
      const panel = this.$refs.picker as HTMLElement | undefined
      const selected = panel?.querySelector<HTMLButtonElement>(
        `button.${style.selected}:not(:disabled)`,
      )
      const today = panel?.querySelector<HTMLButtonElement>(
        `button[value="${this.today}"]:not(:disabled)`,
      )
      const firstDay = panel?.querySelector<HTMLButtonElement>(`table button:not(:disabled)`)
      const target = selected || today || firstDay
      target?.focus({ preventScroll: true })
      if (this.isTime) {
        panel?.querySelectorAll<HTMLElement>(`.${style.timeList}`).forEach((list) => {
          const selected = list.querySelector<HTMLElement>(`.${style.selected}`)
          if (selected)
            list.scrollTop = selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2
        })
      }
    },
  },
  methods: {
    resetPicker() {
      if (this.isTime) {
        const value = String(this.modelValue || '')
        const now = new Date()
        let time = /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
          ? value
          : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        if (!this.allowedTime(time)) {
          time = [this.minimum, this.maximum].find((value) => this.allowedTime(value)) || time
        }
        this.hour = time.slice(0, 2)
        this.minute = time.slice(3, 5)
      } else {
        const value = parseDate(String(this.modelValue || '')) || new Date()
        const bounded =
          this.minimum && dateValue(value) < this.minimum
            ? parseDate(this.minimum) || value
            : this.maximum && dateValue(value) > this.maximum
              ? parseDate(this.maximum) || value
              : value
        this.year = bounded.getFullYear()
        this.month = bounded.getMonth()
      }
    },
    focusControl() {
      const trigger = this.$refs.trigger as HTMLButtonElement | undefined
      trigger?.focus({ preventScroll: true })
    },
    openPicker(toggle: () => void) {
      if (!this.disabled && !this.isReadonly) {
        this.focusControl()
        toggle()
      }
    },
    triggerKey(event: KeyboardEvent, toggle: () => void) {
      if (
        !['Enter', ' ', 'ArrowDown'].includes(event.key) ||
        (event.key === 'ArrowDown' && !event.altKey)
      )
        return
      event.preventDefault()
      this.openPicker(toggle)
    },
    onInput(event: Event) {
      this.draft = (event.target as HTMLInputElement).value
      const value = this.isTime ? parseTimeInput(this.draft) : parseDateInput(this.draft)
      if (!this.draft || value) this.$emit('update:modelValue', value || '')
      this.validate()
    },
    validate() {
      const input = this.$refs.control as HTMLInputElement | undefined
      if (!input) return
      const value = this.isTime ? parseTimeInput(this.draft) : parseDateInput(this.draft)
      let error = ''
      if (this.draft && !value)
        error = this.isTime
          ? 'Введите время в формате ЧЧ:ММ.'
          : 'Введите дату в формате ДД.ММ.ГГГГ.'
      else if (value && !(this.isTime ? this.allowedTime(value) : this.allowedDate(value))) {
        error = this.isTime
          ? 'Выберите время в допустимом диапазоне.'
          : 'Выберите дату в допустимом диапазоне.'
      }
      input.setCustomValidity(error)
    },
    allowedDate(value: string): boolean {
      return (!this.minimum || value >= this.minimum) && (!this.maximum || value <= this.maximum)
    },
    allowedTime(value: string): boolean {
      return timeAllowed(value, this.minimum, this.maximum)
    },
    allowedHour(hour: string): boolean {
      return this.minutes.some((minute) => this.allowedTime(`${hour}:${minute}`))
    },
    changeMonth(offset: number) {
      const date = new Date(this.year, this.month + offset, 1, 12)
      this.year = date.getFullYear()
      this.month = date.getMonth()
    },
    choose(value: string) {
      if (this.disabled || this.isReadonly) return
      if (value && !(this.isTime ? this.allowedTime(value) : this.allowedDate(value))) return
      this.draft = this.isTime ? value : formatDateInput(value)
      this.$emit('update:modelValue', value)
      this.validate()
      this.open = false
    },
    moveTime(event: KeyboardEvent) {
      const list = event.currentTarget as HTMLElement
      const buttons = [...list.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
      const steps: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 }
      let next = index
      if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = buttons.length - 1
      else if (steps[event.key] !== undefined)
        next = Math.max(0, Math.min(buttons.length - 1, index + steps[event.key]!))
      else return
      event.preventDefault()
      buttons[next]?.focus()
    },
    async moveDate(event: KeyboardEvent, value: string) {
      const steps: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      }
      const step = steps[event.key]
      if (step === undefined) return
      event.preventDefault()
      const date = parseDate(value)!
      date.setDate(date.getDate() + step)
      const next = dateValue(date)
      if (!this.allowedDate(next)) return
      this.year = date.getFullYear()
      this.month = date.getMonth()
      await this.$nextTick()
      const panel = this.$refs.picker as HTMLElement
      panel.querySelector<HTMLButtonElement>(`button[value="${next}"]`)?.focus()
    },
  },
})
</script>

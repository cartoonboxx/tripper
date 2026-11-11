import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Input, Select } from '@/components/ui'
import {
  dateValue,
  monthDays,
  parseDate,
  timeAllowed,
} from '@/components/ui/DateTimePicker/DateTimePicker.calendar'

const popupStub = { template: '<div><slot name="trigger" :toggle="() => {}" /><slot /></div>' }

describe('calendar and clock values', () => {
  it('starts weeks on Monday and includes adjacent months across a year boundary', () => {
    const days = monthDays(2027, 0)
    expect(days).toHaveLength(42)
    expect(days[0]).toEqual({ value: '2026-12-28', day: 28, outside: true })
    expect(days.filter((day) => !day.outside)).toHaveLength(31)
    expect(days[days.length - 1]!.value).toBe('2027-02-07')
  })

  it('accepts leap days and rejects invalid or incomplete dates', () => {
    expect(dateValue(parseDate('2024-02-29')!)).toBe('2024-02-29')
    for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-11', '']) {
      expect(parseDate(value)).toBeUndefined()
    }
  })

  it('checks minute precision, bounds and overnight ranges', () => {
    expect(timeAllowed('14:45', '08:00', '21:00')).toBe(true)
    expect(timeAllowed('07:59', '08:00', '21:00')).toBe(false)
    expect(timeAllowed('21:01', '08:00', '21:00')).toBe(false)
    expect(timeAllowed('24:00', '', '')).toBe(false)
    expect(timeAllowed('12:60', '', '')).toBe(false)
    expect(timeAllowed('23:30', '22:00', '06:00')).toBe(true)
    expect(timeAllowed('05:30', '22:00', '06:00')).toBe(true)
    expect(timeAllowed('12:00', '22:00', '06:00')).toBe(false)
  })
})

describe('custom field contracts', () => {
  it('keeps date input validation, manual entry, labels and external values', async () => {
    const wrapper = mount(Input, {
      props: {
        type: 'date',
        label: 'Дата',
        required: true,
        min: '2026-11-01',
        max: '2026-11-30',
        modelValue: '',
      },
      attrs: { id: 'trip-date', name: 'start', class: 'layout-field' },
      global: { stubs: { FloatingPopup: popupStub } },
    })
    const input = wrapper.get('input')
    expect(wrapper.classes()).toContain('layout-field')
    expect(wrapper.get('label').attributes('for')).toBe('trip-date')
    expect(input.attributes()).toMatchObject({
      type: 'text',
      id: 'trip-date',
      name: 'start',
      required: '',
      min: '2026-11-01',
      max: '2026-11-30',
    })
    expect((input.element as HTMLInputElement).checkValidity()).toBe(false)
    await input.setValue('2026-11-12')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-12'])
    await wrapper.setProps({ modelValue: '2026-11-20' })
    expect(input.element.value).toBe('20.11.2026')
    await input.setValue('31.11.2026')
    expect((input.element as HTMLInputElement).checkValidity()).toBe(false)
    await input.setValue('01.12.2026')
    expect((input.element as HTMLInputElement).checkValidity()).toBe(false)
    await input.setValue('15.11.2026')
    expect((input.element as HTMLInputElement).checkValidity()).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['2026-11-15'])
    await wrapper.setProps({ disabled: true })
    expect(input.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('emits select values from popup buttons and blocks disabled options', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'first',
        options: [
          { label: 'Первый', value: 'first' },
          { label: 'Второй', value: 'second' },
          { label: 'Недоступный', value: 'disabled', disabled: true },
        ],
      },
      global: { stubs: { FloatingPopup: popupStub } },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['second']])
    expect(buttons[2]!.attributes('disabled')).toBeDefined()
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})

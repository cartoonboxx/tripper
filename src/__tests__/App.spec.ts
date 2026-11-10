import tabStyle from '@/components/ui/Tab/TabStyle.module.scss'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { Input, Select, Checkbox, Button, Tab } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { tripDays } from '@/composables/format'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('UI kit contracts', () => {
  it('uses the same Input contract for a native multiline field', async () => {
    const wrapper = mount(Input, {
      props: {
        type: 'textarea',
        label: 'Заметки',
        modelValue: 'Первая строка',
        rows: 6,
        size: 'lg',
      },
      attrs: { required: true, maxlength: 200 },
    })
    const field = wrapper.get('textarea')
    expect(wrapper.find('input').exists()).toBe(false)
    expect(field.attributes()).toMatchObject({ rows: '6', required: '', maxlength: '200' })
    expect(field.attributes('type')).toBeUndefined()
    expect(wrapper.get('label').attributes('for')).toBe(field.attributes('id'))
    await field.setValue('Первая строка\nВторая строка')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Первая строка\nВторая строка'])
    await wrapper.setProps({ disabled: true })
    expect(field.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('passes native input attributes and model updates through Style to Base', async () => {
    const wrapper = mount(Input, {
      props: { label: 'Пароль', modelValue: '' },
      attrs: { minlength: 8, autocomplete: 'new-password' },
    })
    expect(wrapper.get('input').attributes('minlength')).toBe('8')
    await wrapper.get('input').setValue('new-password')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new-password'])
  })
  it('renders optional labels above controls without empty labels or redundant attributes', () => {
    for (const component of [Input, Select]) {
      const wrapper = mount(component, {
        props: { label: 'Направление', options: [{ value: 'it', label: 'Италия' }] },
        attrs: { id: 'destination' },
      })
      const control = wrapper.get('input, select')
      expect(wrapper.get('label').attributes('for')).toBe(control.attributes('id'))
      expect(wrapper.findAll('#destination')).toHaveLength(1)
      expect(wrapper.element.firstElementChild?.tagName).toBe('LABEL')
      const plain = mount(component, { props: { label: '  ' } })
      expect(plain.find('label').exists()).toBe(false)
      expect(plain.get('input, select').attributes('id')).toBeUndefined()
    }
  })
  it('keeps field layout attrs on the root and control attrs on native fields', async () => {
    for (const component of [Input, Select]) {
      const wrapper = mount(component, {
        props: { label: 'Направление', options: [{ value: 'it', label: 'Италия' }] },
        attrs: { id: 'field', class: 'custom-field', style: { width: '240px' }, required: true },
      })
      expect(wrapper.classes()).toContain('custom-field')
      expect(wrapper.attributes('style')).toContain('width: 240px')
      expect(wrapper.attributes('id')).toBeUndefined()
      expect(wrapper.get('input, select').attributes()).toMatchObject({ id: 'field', required: '' })
      await wrapper.get('input, select').setValue('it')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['it'])
    }
  })
  it('preserves named input slots and optional checkbox content', () => {
    const input = mount(Input, {
      slots: { prefix: '<span>До</span>', suffix: '<span>После</span>' },
    })
    const control = input.get('input').element
    expect(control.previousElementSibling?.textContent).toBe('До')
    expect(control.nextElementSibling?.textContent).toBe('После')
    expect(mount(Checkbox, { props: { label: 'Подпись' } }).text()).toBe('Подпись')
    expect(mount(Checkbox, { slots: { default: 'Свой текст' } }).text()).toBe('Свой текст')
    expect(mount(Checkbox).find('span').exists()).toBe(false)
    expect(
      mount(Button, { slots: { default: 'Продолжить' } })
        .get('button')
        .attributes('type'),
    ).toBe('button')
  })
  it('forwards checkbox model changes and respects disabled buttons', async () => {
    const checkbox = mount(Checkbox, { props: { label: 'Паспорт', modelValue: false } })
    await checkbox.get('input').setValue(true)
    expect(checkbox.emitted('update:modelValue')?.[0]).toEqual([true])
    const button = mount(Button, { props: { disabled: true }, slots: { default: 'Сохранить' } })
    expect(button.get('button').attributes()).toHaveProperty('disabled')
    const tab = mount(Tab, { props: { active: true, variant: 'line' } })
    expect(tab.get('button').classes()).toContain(tabStyle.isActive)
    expect(tab.get('button').classes()).toContain(tabStyle.uiTabLine)
  })
})

describe('travel data', () => {
  it('saves changes and restores them in a fresh store', async () => {
    const store = useTravelStore()
    store.trips[0]!.notes = 'Проверить билеты'
    store.checklists[0]!.items[0]!.checked = false
    await nextTick()
    setActivePinia(createPinia())
    const restored = useTravelStore()
    expect(restored.trips[0]!.notes).toBe('Проверить билеты')
    expect(restored.checklists[0]!.items[0]!.checked).toBe(false)
  })
  it('preserves legacy plans when migrating to the Tripper storage namespace', async () => {
    localStorage.setItem(
      'tripplan:profile',
      JSON.stringify({ name: 'Мария', email: 'maria@example.com', notifications: false }),
    )
    const store = useTravelStore()
    expect(store.profile.name).toBe('Мария')
    store.profile.name = 'Мария Петрова'
    await nextTick()
    expect(JSON.parse(localStorage.getItem('tripper:profile') || '{}').name).toBe('Мария Петрова')
  })
  it('limits shared editing to the organizer', () => {
    const store = useTravelStore()
    expect(store.editable('florence')).toBe(true)
    store.trips[0]!.role = 'viewer'
    expect(store.editable('florence')).toBe(false)
    expect(store.editable('missing')).toBe(false)
  })
  it('enumerates local calendar days across month and year boundaries', () => {
    expect(tripDays('2026-12-30', '2027-01-02')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ])
    expect(tripDays('2026-11-10', '2026-11-09')).toEqual([])
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import Checklists from '@/pages/Checklists/ChecklistsComponent.vue'
import Expenses from '@/pages/Expenses/ExpensesComponent.vue'
import Places from '@/pages/Places/PlacesComponent.vue'
import { useTravelStore } from '@/stores/travel'

const tripPage = {
  mocks: { $route: { params: { tripId: 'florence' } } },
  stubs: { AppLink: true },
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('page actions', () => {
  it('creates a linked checklist and saves, checks and removes its items', async () => {
    const wrapper = shallowMount(Checklists, { global: tripPage })
    const page = wrapper.vm
    page.openCreate()
    page.title = 'Новый список'
    page.create()
    expect(page.active?.tripId).toBe('florence')
    page.newItem = '  Билеты  '
    page.addItem()
    const item = page.active!.items[0]!
    expect(item.title).toBe('Билеты')
    page.startEdit(item)
    page.editTitle = ' Электронные билеты '
    page.saveItem()
    expect(item.title).toBe('Электронные билеты')
    expect(page.editingItem).toBeUndefined()
    item.checked = true
    await nextTick()
    expect(page.percent).toBe(100)
    expect(page.activeDescription).toContain('1 из 1 готово')
    page.removeItem(item)
    expect(page.active?.items).toHaveLength(0)
    expect(page.percent).toBe(0)
    page.removeList()
    expect(page.store.checklists.some((list) => list.title === 'Новый список')).toBe(false)
    wrapper.unmount()
  })

  it('isolates trip checklists and copies general lists with independent progress', async () => {
    const scoped = shallowMount(Checklists, { global: tripPage })
    const general = shallowMount(Checklists, {
      global: { ...tripPage, mocks: { $route: { params: {} } } },
    })
    scoped.vm.openCreate()
    scoped.vm.title = 'Только в поездке'
    scoped.vm.create()
    const tripListId = scoped.vm.active!.id
    expect(general.vm.lists.some((list) => list.id === tripListId)).toBe(false)
    general.vm.openCreate()
    general.vm.title = 'Общий список'
    general.vm.create()
    general.vm.newItem = 'Паспорт'
    general.vm.addItem()
    const source = general.vm.active!
    source.items[0]!.checked = true
    general.vm.openAddToTrip()
    general.vm.targetTrip = 'florence'
    general.vm.addToTrip()
    const copy = scoped.vm.lists.find((list) => list.title === source.title)!
    expect(source.tripId).toBe('')
    expect(copy.id).not.toBe(source.id)
    expect(copy.items[0]!.id).not.toBe(source.items[0]!.id)
    expect(copy.items[0]!.checked).toBe(false)
    copy.items[0]!.title = 'Другой пункт'
    expect(source.items[0]!.title).toBe('Паспорт')
    general.vm.openCreate()
    general.vm.title = 'Сразу на Алтай'
    general.vm.linkedTrip = 'altai'
    general.vm.create()
    expect(general.vm.lists.map((list) => list.title)).toEqual(['Общий список'])
    expect(scoped.vm.lists.some((list) => list.title === 'Сразу на Алтай')).toBe(false)
    await nextTick()
    setActivePinia(createPinia())
    expect(useTravelStore().checklists.find((list) => list.id === copy.id)?.tripId).toBe('florence')
    scoped.unmount()
    general.unmount()
  })

  it('filters expenses, calculates totals and preserves store order', async () => {
    const wrapper = shallowMount(Expenses, { global: tripPage })
    const page = wrapper.vm
    const originalOrder = page.store.expenses.map((expense) => expense.id)
    expect(page.latestExpenses.map((expense) => expense.id)).toEqual(
      [...page.expenses].reverse().map((expense) => expense.id),
    )
    expect(page.store.expenses.map((expense) => expense.id)).toEqual(originalOrder)
    page.open()
    page.form.title = 'Кофе у реки'
    page.form.amount = '350'
    page.save()
    const expense = page.store.expenses[page.store.expenses.length - 1]!
    expect(expense).toMatchObject({ title: 'Кофе у реки', amount: 350, tripId: 'florence' })
    page.category = 'Питание'
    await nextTick()
    expect(page.expenses.every((expense) => expense.category === 'Питание')).toBe(true)
    expect(page.total).toBe(page.tripExpenses.reduce((sum, expense) => sum + expense.amount, 0))
    page.removeExpense(expense)
    expect(page.store.expenses.some((current) => current.id === expense.id)).toBe(false)
    wrapper.unmount()
  })

  it('keeps totals and member statistics scoped to the selected trip independently of category filters', () => {
    const store = useTravelStore()
    store.expenses = [
      { id: 'one', tripId: 'florence', title: 'Обед', category: 'Питание', amount: 300 },
      { id: 'two', tripId: 'florence', title: 'Такси', category: 'Транспорт', amount: 600 },
      { id: 'other', tripId: 'altai', title: 'Отель', category: 'Проживание', amount: 5000 },
    ]
    const wrapper = shallowMount(Expenses, {
      global: {
        ...tripPage,
        mocks: { $route: { params: {} } },
      },
    })
    const page = wrapper.vm
    expect(page.total).toBe(900)
    expect(page.members).toBe(3)
    page.category = 'Питание'
    expect(page.expenses).toHaveLength(1)
    expect(page.total).toBe(900)
    page.expenseTripId = 'altai'
    expect(page.category).toBe('all')
    expect(page.total).toBe(5000)
    expect(page.expenses.map((expense) => expense.id)).toEqual(['other'])
    page.open()
    expect(page.form.tripId).toBe('altai')
    wrapper.unmount()
  })

  it('shows only attached checklists in the trip and reacts to attachment changes', () => {
    const store = useTravelStore()
    store.checklists = [
      { id: 'free', tripId: '', title: 'Без поездки', items: [] },
      { id: 'mine', tripId: 'florence', title: 'Мой список', items: [] },
      { id: 'other', tripId: 'altai', title: 'Другой список', items: [] },
    ]
    const wrapper = shallowMount(Checklists, { props: { attachedOnly: true }, global: tripPage })
    expect(wrapper.vm.lists.map((list) => list.id)).toEqual(['mine'])
    store.checklists[0]!.tripId = 'florence'
    expect(wrapper.vm.lists.map((list) => list.id)).toEqual(['free', 'mine'])
    store.checklists[1]!.tripId = ''
    expect(wrapper.vm.lists.map((list) => list.id)).toEqual(['free'])
    wrapper.unmount()
  })

  it('keeps place edits separate until save and resets the next creation form', () => {
    const wrapper = shallowMount(Places, { global: tripPage })
    const page = wrapper.vm
    const existing = page.store.placesForTrip('florence')[0]!
    const originalName = existing.name
    page.open(existing)
    page.form.name = 'Новое название'
    expect(existing.name).toBe(originalName)
    page.save()
    expect(existing.name).toBe('Новое название')
    page.open()
    expect(page.form.name).toBe('')
    expect(page.editing).toBeUndefined()
    page.form.name = 'Новое место'
    page.save()
    const created = page.store.places[page.store.places.length - 1]!
    expect(created).toMatchObject({ name: 'Новое место' })
    expect(page.store.placesForTrip('florence')).toContainEqual(created)
    expect(created.id).not.toBe(existing.id)
    page.detail = created
    page.detachFromTrip('florence')
    expect(page.store.placesForTrip('florence')).not.toContainEqual(created)
    expect(page.store.places).toContainEqual(created)
    page.deleting = created
    page.remove()
    expect(page.store.places.some((place) => place.id === created.id)).toBe(false)
    wrapper.unmount()
  })

  it('prevents viewers from saving shared expenses or places', () => {
    const store = useTravelStore()
    store.trips.find((trip) => trip.id === 'florence')!.role = 'viewer'
    const expenses = shallowMount(Expenses, { global: tripPage })
    const places = shallowMount(Places, { global: tripPage })
    const expenseCount = store.expenses.length
    const placeCount = store.places.length
    expenses.vm.open()
    expenses.vm.form.amount = '500'
    expenses.vm.save()
    places.vm.open()
    places.vm.form.name = 'Недоступное изменение'
    places.vm.save()
    expect(expenses.vm.canAddExpense).toBe(false)
    expect(store.expenses).toHaveLength(expenseCount)
    expect(store.places).toHaveLength(placeCount)
    expenses.unmount()
    places.unmount()
  })
})

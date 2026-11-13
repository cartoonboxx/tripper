import { beforeEach, describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import Checklists from '@/pages/Checklists/ChecklistsPage.vue'
import Expenses from '@/pages/Expenses/ExpensesPage.vue'
import Places from '@/pages/Places/PlacesPage.vue'
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
    general.vm.title = 'Ещё один личный список'
    general.vm.create()
    expect(general.vm.active?.tripId).toBe('')
    expect(general.vm.lists.map((list) => list.title)).toEqual([
      'Общий список',
      'Ещё один личный список',
    ])
    expect(scoped.vm.lists.some((list) => list.title === 'Ещё один личный список')).toBe(false)
    await nextTick()
    setActivePinia(createPinia())
    expect(useTravelStore().checklists.find((list) => list.id === copy.id)?.tripId).toBe('florence')
    scoped.unmount()
    general.unmount()
  })

  it('attaches a personal checklist from the trip page with independent progress', async () => {
    const store = useTravelStore()
    store.checklists = [
      {
        id: 'personal',
        tripId: '',
        title: 'Вещи',
        items: [{ id: 'passport', title: 'Паспорт', checked: true }],
      },
      { id: 'other', tripId: 'altai', title: 'Другой список', items: [] },
    ]
    const wrapper = shallowMount(Checklists, { global: tripPage })
    const page = wrapper.vm
    expect(page.checklistOptions).toEqual([{ value: 'personal', label: 'Вещи' }])
    page.openAttach()
    page.attach()
    const copy = page.active!
    expect(copy.tripId).toBe('florence')
    expect(copy.id).not.toBe('personal')
    expect(copy.items[0]).toMatchObject({ title: 'Паспорт', checked: false })
    expect(copy.items[0]!.id).not.toBe('passport')
    expect(page.attaching).toBe(false)
    copy.items[0]!.title = 'Загранпаспорт'
    expect(store.checklists[0]!.items[0]).toEqual({
      id: 'passport',
      title: 'Паспорт',
      checked: true,
    })
    await nextTick()
    setActivePinia(createPinia())
    expect(useTravelStore().checklists.find((list) => list.id === copy.id)).toMatchObject({
      tripId: 'florence',
    })
    wrapper.unmount()
  })

  it('rejects attaching trip lists, missing sources and inaccessible trips', () => {
    const store = useTravelStore()
    store.checklists = [
      { id: 'personal', tripId: '', title: 'Вещи', items: [] },
      { id: 'attached', tripId: 'florence', title: 'Документы', items: [] },
    ]
    const originalCount = store.checklists.length
    expect(store.copyChecklistToTrip('attached', 'altai')).toBeUndefined()
    expect(store.copyChecklistToTrip('missing', 'florence')).toBeUndefined()
    expect(store.copyChecklistToTrip('personal', 'missing')).toBeUndefined()
    store.trips.find((trip) => trip.id === 'florence')!.role = 'viewer'
    expect(store.copyChecklistToTrip('personal', 'florence')).toBeUndefined()
    store.trips.find((trip) => trip.id === 'altai')!.archived = true
    expect(store.copyChecklistToTrip('personal', 'altai')).toBeUndefined()
    expect(store.checklists).toHaveLength(originalCount)
    const wrapper = shallowMount(Checklists, { global: tripPage })
    wrapper.vm.openAttach()
    expect(wrapper.vm.attaching).toBe(false)
    wrapper.unmount()
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

  it('closes stale expense forms when changing trips and cannot save into another trip', async () => {
    const wrapper = shallowMount(Expenses, {
      global: { ...tripPage, mocks: { $route: { params: {} } } },
    })
    const page = wrapper.vm
    const count = page.store.expenses.length
    page.open()
    page.form.title = 'Старая форма'
    page.form.amount = '100'
    page.category = 'Питание'
    page.expenseTripId = 'altai'
    await nextTick()
    expect(page.creating).toBe(false)
    expect(page.category).toBe('all')
    page.save()
    expect(page.store.expenses).toHaveLength(count)
    page.open()
    expect(page.form.tripId).toBe('altai')
    wrapper.unmount()
  })

  it('allows place editing only in the global library, even for trip organizers', () => {
    const wrapper = shallowMount(Places, { global: tripPage })
    const page = wrapper.vm
    const place = page.store.places[0]!
    const name = place.name
    page.open(place)
    expect(page.creating).toBe(false)
    page.editing = place
    page.form.name = 'Изменено из поездки'
    page.save()
    expect(place.name).toBe(name)
    page.deleting = place
    page.remove()
    expect(page.store.places).toContainEqual(place)
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
    const wrapper = shallowMount(Places, {
      global: { ...tripPage, mocks: { $route: { params: {} } } },
    })
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
    expect(page.store.placesForTrip('florence')).not.toContainEqual(created)
    page.detail = created
    page.store.addPlaceToTrip(created.id, 'florence')
    expect(page.store.placesForTrip('florence')).toContainEqual(created)
    expect(created.id).not.toBe(existing.id)
    page.deleting = created
    page.remove()
    expect(page.store.places.some((place) => place.id === created.id)).toBe(false)
    expect(page.store.placesForTrip('florence')).not.toContainEqual(created)
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useTravelStore } from '@/stores/travel'
import { imageAssets, initialTrips, initialEvents, initialPlaces } from '@/data/trips.data'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('saved places', () => {
  it('migrates legacy links and preserves them through repeated reloads', () => {
    localStorage.setItem(
      'tripplan:places',
      JSON.stringify(
        initialPlaces.map((place) => ({
          ...place,
          tripId: 'florence',
          planned: true,
        })),
      ),
    )
    const store = useTravelStore()
    expect(store.placesForTrip('florence')).toHaveLength(initialPlaces.length)
    expect(store.places[0]).not.toHaveProperty('tripId')
    expect(store.places[0]).not.toHaveProperty('planned')
    setActivePinia(createPinia())
    expect(useTravelStore().placesForTrip('florence')).toHaveLength(initialPlaces.length)
  })

  it('reuses a place in multiple trips and keeps it after detaching', async () => {
    const store = useTravelStore()
    const place = store.places[0]!
    const trip = store.trips.find((trip) => trip.id !== 'florence' && trip.role === 'organizer')!
    expect(store.addPlaceToTrip(place.id, trip.id)).toBe(true)
    expect(store.addPlaceToTrip(place.id, trip.id)).toBe(false)
    expect(store.tripsForPlace(place.id)).toHaveLength(2)
    store.removePlaceFromTrip(place.id, 'florence')
    expect(store.places).toContainEqual(place)
    expect(store.placesForTrip('florence')).not.toContainEqual(place)
    expect(store.placesForTrip(trip.id)).toContainEqual(place)
    await nextTick()
    setActivePinia(createPinia())
    const restored = useTravelStore()
    expect(restored.placesForTrip('florence')).not.toContainEqual(place)
    expect(restored.placesForTrip(trip.id)).toContainEqual(place)
    restored.removePlace(place.id)
    expect(restored.tripPlaces.some((link) => link.placeId === place.id)).toBe(false)
  })

  it('protects viewer trips and rejects missing places', () => {
    const store = useTravelStore()
    store.trips.find((trip) => trip.id === 'florence')!.role = 'viewer'
    const links = structuredClone(store.tripPlaces.map((link) => ({ ...link })))
    expect(store.addPlaceToTrip('missing', 'florence')).toBe(false)
    store.removePlaceFromTrip(store.places[0]!.id, 'florence')
    expect(store.tripPlaces).toEqual(links)
  })
})

describe('event reordering', () => {
  it('inserts an event across multiple positions, preserves time slots and persists the order', async () => {
    const store = useTravelStore()
    const original = store.events[0]!
    store.events = ['first', 'middle', 'last'].map((id, index) => ({
      ...original,
      id,
      start: `${10 + index * 2}:00`,
      end: `${11 + index * 2}:00`,
    }))
    expect(store.moveEvent('first', 'last')).toBe(true)
    expect(store.events.map(({ id, start, end }) => [id, start, end])).toEqual([
      ['middle', '10:00', '11:00'],
      ['last', '12:00', '13:00'],
      ['first', '14:00', '15:00'],
    ])
    await nextTick()
    setActivePinia(createPinia())
    const restored = useTravelStore()
    expect(restored.events.map((event) => event.id)).toEqual(['middle', 'last', 'first'])
    expect(restored.moveEvent('first', 'middle')).toBe(true)
    expect(restored.events.map((event) => event.id)).toEqual(['first', 'middle', 'last'])
    expect(restored.events.map((event) => event.start)).toEqual(['10:00', '12:00', '14:00'])
  })

  it('rejects invalid moves and protects read-only schedules', () => {
    const store = useTravelStore()
    const first = store.events[0]!
    const second = store.events[1]!
    expect(store.moveEvent(first.id, first.id)).toBe(false)
    expect(store.moveEvent(first.id, 'missing')).toBe(false)
    second.day = '2030-01-01'
    expect(store.moveEvent(first.id, second.id)).toBe(false)
    second.day = first.day
    second.tripId = 'missing'
    expect(store.moveEvent(first.id, second.id)).toBe(false)
    second.tripId = first.tripId
    store.trips.find((trip) => trip.id === first.tripId)!.role = 'viewer'
    const original = JSON.stringify(store.events)
    expect(store.moveEvent(first.id, second.id)).toBe(false)
    expect(JSON.stringify(store.events)).toBe(original)
  })

  it('exchanges both time boundaries and persists the new order', async () => {
    const store = useTravelStore()
    const first = store.events[0]!
    const second = store.events.find((event) => event.id !== first.id && event.day === first.day)!
    const before = [first.start, first.end, second.start, second.end]
    expect(store.swapEvents(first.id, second.id)).toBe(true)
    expect([first.start, first.end, second.start, second.end]).toEqual([
      before[2],
      before[3],
      before[0],
      before[1],
    ])
    expect(store.events[0]!.id).toBe(second.id)
    await nextTick()
    setActivePinia(createPinia())
    const restored = useTravelStore()
    expect(restored.events[0]).toMatchObject({ id: second.id, start: before[0], end: before[1] })
  })

  it('rejects swaps across days, trips, missing events and viewer permissions', () => {
    const store = useTravelStore()
    const first = store.events[0]!
    const second = store.events[1]!
    const original = JSON.stringify(store.events)
    expect(store.swapEvents(first.id, first.id)).toBe(false)
    expect(store.swapEvents(first.id, 'missing')).toBe(false)
    second.day = '2030-01-01'
    expect(store.swapEvents(first.id, second.id)).toBe(false)
    second.day = first.day
    second.tripId = 'missing'
    expect(store.swapEvents(first.id, second.id)).toBe(false)
    second.tripId = first.tripId
    store.trips.find((trip) => trip.id === first.tripId)!.role = 'viewer'
    expect(store.swapEvents(first.id, second.id)).toBe(false)
    expect(JSON.stringify(store.events)).toBe(original)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('archived trips', () => {
  for (const namespace of ['tripper', 'tripplan']) {
    it(`migrates completed trips from ${namespace} without losing their data`, async () => {
      const legacyTrip = { ...initialTrips[0]!, status: 'completed', archived: false }
      const upcomingTrip = initialTrips[1]!
      localStorage.setItem(`${namespace}:trips`, JSON.stringify([legacyTrip, upcomingTrip]))
      const store = useTravelStore()
      expect(store.trips[0]).toEqual({ ...legacyTrip, status: 'upcoming', archived: true })
      expect(store.trips[1]).toEqual(upcomingTrip)
      expect(store.events).toEqual(initialEvents)
      expect(store.placesForTrip(legacyTrip.id)).not.toHaveLength(0)
      expect(JSON.parse(localStorage.getItem('tripper:trips')!)[0].archived).toBe(true)

      // Restoring a migrated trip must survive future reloads.
      store.trips[0]!.archived = false
      await nextTick()
      setActivePinia(createPinia())
      expect(useTravelStore().trips[0]).toEqual({
        ...legacyTrip,
        status: 'upcoming',
        archived: false,
      })
    })
  }

  it('starts with past sample trips in the archive', () => {
    const trip = useTravelStore().trips.find((trip) => trip.id === 'petersburg')!
    expect(trip.archived).toBe(true)
    expect(trip.status).toBe('upcoming')
  })
})

describe('state restoration', () => {
  it('falls back to defaults for broken JSON and incompatible stored values', () => {
    localStorage.setItem('tripper:trips', '{broken')
    localStorage.setItem('tripper:events', '{}')
    localStorage.setItem('tripper:profile', 'null')
    localStorage.setItem('tripper:session', '[]')
    const store = useTravelStore()
    expect(store.trips).toEqual(initialTrips)
    expect(store.events).toEqual(initialEvents)
    expect(store.profile.name).toBe('Александр')
    expect(store.session).toBe(false)
  })

  it('refreshes saved build image URLs and keeps external images', () => {
    localStorage.setItem(
      'tripper:trips',
      JSON.stringify([
        { ...initialTrips[0], image: '/assets/florence-oldhash.jpg' },
        { ...initialTrips[1], image: 'https://example.com/custom.jpg' },
      ]),
    )
    localStorage.setItem(
      'tripper:events',
      JSON.stringify([{ ...initialEvents[0], image: '/assets/garden-oldhash.jpg' }]),
    )
    localStorage.setItem(
      'tripper:places',
      JSON.stringify([
        { ...initialPlaces[0], image: '/assets/gallery-oldhash.jpg' },
        { ...initialPlaces[1], image: 'data:image/png;base64,foodgallery' },
      ]),
    )
    const store = useTravelStore()
    expect(store.trips[0]!.image).toBe(imageAssets.florence)
    expect(store.trips[1]!.image).toBe('https://example.com/custom.jpg')
    expect(store.events[0]!.image).toBe(imageAssets.garden)
    expect(store.places[0]!.image).toBe(imageAssets.gallery)
    expect(store.places[1]!.image).toBe('data:image/png;base64,foodgallery')
  })

  it('uses current place links over legacy links and drops missing places', () => {
    localStorage.setItem(
      'tripper:places',
      JSON.stringify([{ ...initialPlaces[0], tripId: 'florence' }]),
    )
    const link = { placeId: initialPlaces[0]!.id, tripId: 'altai' }
    localStorage.setItem(
      'tripper:tripPlaces',
      JSON.stringify([link, { placeId: 'missing', tripId: 'florence' }]),
    )
    expect(useTravelStore().tripPlaces).toEqual([link])
  })
})

describe('option store persistence', () => {
  it('initializes once and persists only changed durable fields', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const store = useTravelStore()
    const initialWrites = write.mock.calls.length
    expect(useTravelStore()).toBe(store)
    expect(write).toHaveBeenCalledTimes(initialWrites)
    store.profile.name = 'Новое имя'
    await nextTick()
    expect(write).toHaveBeenCalledTimes(initialWrites + 1)
    expect(write).toHaveBeenLastCalledWith('tripper:profile', JSON.stringify(store.profile))
    store.toast = 'Временное уведомление'
    await nextTick()
    expect(write).toHaveBeenCalledTimes(initialWrites + 1)
    expect(localStorage.getItem('tripper:toast')).toBeNull()
  })

  it('keeps persistence active after the first consuming component unmounts', async () => {
    const wrapper = mount(
      defineComponent({
        data() {
          return { store: useTravelStore() }
        },
        template: '<p>{{ store.profile.name }}</p>',
      }),
    )
    const store = wrapper.vm.store
    wrapper.unmount()
    store.profile.name = 'После перехода'
    await nextTick()
    expect(JSON.parse(localStorage.getItem('tripper:profile')!).name).toBe('После перехода')
  })

  it('reports a failed storage write and still saves other fields', () => {
    const nativeWrite = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'tripper:trips') throw new Error('Storage unavailable')
      nativeWrite.call(this, key, value)
    })
    const store = useTravelStore()
    expect(store.storageError).toBe(true)
    expect(localStorage.getItem('tripper:profile')).not.toBeNull()
  })

  it('replaces a notification and restarts its dismissal timer', async () => {
    vi.useFakeTimers()
    const store = useTravelStore()
    store.notify('Первое')
    await vi.advanceTimersByTimeAsync(3000)
    store.notify('Второе')
    await vi.advanceTimersByTimeAsync(500)
    expect(store.toast).toBe('Второе')
    await vi.advanceTimersByTimeAsync(3000)
    expect(store.toast).toBe('')
  })
})

describe('custom categories', () => {
  it('normalizes names, rejects duplicates within each domain and persists additions', async () => {
    const store = useTravelStore()
    expect(store.addCategory('expenses', '  Страховка   и визы  ')).toBe(true)
    expect(store.addCategory('expenses', 'страховка и ВИЗЫ')).toBe(false)
    expect(store.addCategory('events', 'Страховка и визы')).toBe(true)
    expect(store.addCategory('places', '   ')).toBe(false)
    await nextTick()
    setActivePinia(createPinia())
    expect(useTravelStore().categoryOptions('expenses')).toContainEqual({
      label: 'Страховка и визы',
      value: 'Страховка и визы',
    })
  })

  it('deletes custom categories without changing records or resurrecting them on reload', async () => {
    const store = useTravelStore()
    store.addCategory('places', 'Галерея')
    store.places[0]!.category = 'Галерея'
    expect(store.removeCategory('places', 'Музей')).toBe(false)
    expect(store.removeCategory('places', 'Галерея')).toBe(true)
    expect(store.removeCategory('places', 'Галерея')).toBe(false)
    expect(store.places[0]!.category).toBe('Галерея')
    await nextTick()
    setActivePinia(createPinia())
    const restored = useTravelStore()
    expect(restored.categories.places).not.toContain('Галерея')
    expect(restored.places[0]!.category).toBe('Галерея')
    expect(restored.addCategory('places', 'Галерея')).toBe(true)
  })

  it('restores used categories and ignores malformed saved lists', () => {
    localStorage.setItem(
      'tripper:categories',
      JSON.stringify({ expenses: [null, 4, ' Тест ', 'тест'], places: 'invalid' }),
    )
    localStorage.setItem(
      'tripper:places',
      JSON.stringify([{ ...initialPlaces[0], category: 'Галерея' }]),
    )
    const store = useTravelStore()
    expect(
      store.categories.expenses.filter((category) => category.toLowerCase() === 'тест'),
    ).toEqual(['Тест'])
    expect(store.categories.places).toContain('Галерея')
    expect(store.categories.places).toContain('Парк')
  })
})

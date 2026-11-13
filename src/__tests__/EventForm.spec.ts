import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventForm from '@/components/trip/EventForm.vue'
import { useTravelStore } from '@/stores/travel'
import type { PlanEvent } from '@/types/trip.types'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mountForm(event?: PlanEvent) {
  return shallowMount(EventForm, {
    props: { open: true, tripId: 'florence', day: '2026-11-11', event },
  })
}

describe('event places and photos', () => {
  it('sets the end an hour after a changed start, preserves minutes and permits a manual end', () => {
    const wrapper = mountForm()
    wrapper.vm.updateStart('14:35')
    expect(wrapper.vm.form.end).toBe('15:35')
    wrapper.vm.form.end = '16:10'
    wrapper.vm.save()
    const store = useTravelStore()
    expect(store.events[store.events.length - 1]?.end).toBe('16:10')
    wrapper.vm.updateStart('09:05')
    expect(wrapper.vm.form.end).toBe('10:05')
    wrapper.vm.updateStart('')
    expect(wrapper.vm.form.end).toBe('10:05')
    wrapper.unmount()
  })

  it('preserves an existing duration when opening an event and updates it only after a start change', async () => {
    const event = useTravelStore().events[0]!
    const wrapper = mountForm(event)
    expect(wrapper.vm.form.end).toBe(event.end)
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    expect(wrapper.vm.form.end).toBe(event.end)
    wrapper.vm.updateStart('15:20')
    expect(wrapper.vm.form.end).toBe('16:20')
    wrapper.unmount()
  })

  it('saves a one-hour event crossing midnight', () => {
    const store = useTravelStore()
    const wrapper = mountForm()
    wrapper.vm.updateStart('23:45')
    expect(wrapper.vm.form.end).toBe('00:45')
    expect(wrapper.vm.endsNextDay).toBe(true)
    wrapper.vm.save()
    expect(store.events[store.events.length - 1]).toMatchObject({
      day: '2026-11-11',
      start: '23:45',
      end: '00:45',
    })
    wrapper.unmount()
  })

  it('offers all saved places, selects duplicate names by ID and links the chosen place on save', () => {
    const store = useTravelStore()
    const original = store.places[0]!
    const place = { ...original, id: 'unlinked', address: 'Другой адрес' }
    store.places.push(place)
    const wrapper = mountForm()
    const form = wrapper.vm
    expect(form.places).toContainEqual({ label: `${place.name} · Другой адрес`, value: place.id })
    expect(store.placesForTrip('florence')).not.toContainEqual(place)
    form.selectedPlaceId = place.id
    form.form.title = 'Новое событие'
    form.save()
    expect(store.events[store.events.length - 1]).toMatchObject({
      placeId: place.id,
      place: place.name,
      image: '',
    })
    expect(store.placesForTrip('florence')).toContainEqual(place)
    wrapper.unmount()
  })

  it('preserves an uploaded photo when saving a selected place and when reopening an event', () => {
    const store = useTravelStore()
    const wrapper = mountForm()
    wrapper.vm.selectedPlaceId = store.places[0]!.id
    wrapper.vm.setPhoto('data:image/png;base64,custom')
    wrapper.vm.save()
    const event = store.events[store.events.length - 1]!
    expect(event.image).toBe('data:image/png;base64,custom')
    const edit = mountForm(event)
    expect(edit.vm.selectedPlaceId).toBe(store.places[0]!.id)
    edit.vm.setPhoto('')
    edit.vm.save()
    expect(event.image).toBe('')
    wrapper.unmount()
    edit.unmount()
  })

  it('preserves a legacy place missing from saved places until the user clears it', async () => {
    const store = useTravelStore()
    const event = store.events[0]!
    event.place = 'Старое место'
    const wrapper = mountForm(event)
    expect(wrapper.vm.places).toContainEqual({ label: 'Старое место', value: 'legacy' })
    wrapper.vm.save()
    expect(event.place).toBe('Старое место')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    wrapper.vm.selectedPlaceId = ''
    wrapper.vm.save()
    expect(event.place).toBe('')
    wrapper.unmount()
  })

  it('does not link places or save events when the date is invalid or the trip is read-only', () => {
    const store = useTravelStore()
    const place = { ...store.places[0]!, id: 'unlinked' }
    store.places.push(place)
    const wrapper = mountForm()
    const count = store.events.length
    wrapper.vm.selectedPlaceId = place.id
    wrapper.vm.form.day = '2027-01-01'
    wrapper.vm.save()
    expect(store.events).toHaveLength(count)
    expect(store.placesForTrip('florence')).not.toContainEqual(place)
    wrapper.vm.form.day = '2026-11-11'
    store.trips[0]!.role = 'viewer'
    wrapper.vm.save()
    expect(store.events).toHaveLength(count)
    expect(store.placesForTrip('florence')).not.toContainEqual(place)
    wrapper.unmount()
  })
})

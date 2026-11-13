import { defineStore } from 'pinia'
import type { PlanEvent } from '@/types/trip.types'
import { createPasswordCredential, verifyPassword, savePasswordCredential } from '@/utils/password'
import { defaultCategories } from '@/data/categories.data'
import type { CategoryDomain } from '@/types/category.types'
import { createTravelState } from './travel.state'
import { persistTravelStore } from './travel.storage'

const notificationTimers = new WeakMap<object, ReturnType<typeof setTimeout>>()

const createTravelStore = defineStore('travel', {
  state: createTravelState,
  getters: {
    sortedTrips: (state) => [...state.trips].sort((a, b) => a.start.localeCompare(b.start)),
    imageForEvent(): (event: PlanEvent) => string {
      return (event) => this.placeForEvent(event)?.image || event.image
    },
    placeForEvent: (state) => (event: PlanEvent) => {
      if (event.placeId) return state.places.find((place) => place.id === event.placeId)
      const matches = state.places.filter((place) => place.name === event.place)
      return matches.length === 1 ? matches[0] : undefined
    },
    categoryOptions: (state) => (domain: CategoryDomain) =>
      state.categories[domain].map((value) => ({ label: value, value })),
    members: (state) => (tripId: string) =>
      state.participants.filter((member) => member.tripId === tripId),
    editable: (state) => (tripId: string) =>
      state.trips.find((trip) => trip.id === tripId)?.role === 'organizer',
    placesForTrip: (state) => (tripId: string) => {
      const ids = new Set(
        state.tripPlaces.filter((link) => link.tripId === tripId).map((link) => link.placeId),
      )
      return state.places.filter((place) => ids.has(place.id))
    },
    tripsForPlace: (state) => (placeId: string) => {
      const ids = new Set(
        state.tripPlaces.filter((link) => link.placeId === placeId).map((link) => link.tripId),
      )
      return state.trips.filter((trip) => ids.has(trip.id))
    },
  },
  actions: {
    async changePassword(currentPassword: string, newPassword: string): Promise<string> {
      if (newPassword.length < 8) return 'Новый пароль должен содержать не менее 8 символов.'
      const previous = this.passwordCredential
      if (previous && !(await verifyPassword(currentPassword, previous)))
        return 'Текущий пароль указан неверно.'
      if (previous && currentPassword === newPassword)
        return 'Новый пароль должен отличаться от текущего.'
      const credential = await createPasswordCredential(newPassword)
      if (this.passwordCredential !== previous) return 'Пароль уже изменён. Попробуйте ещё раз.'
      savePasswordCredential(credential)
      this.passwordCredential = credential
      return ''
    },
    addCategory(domain: CategoryDomain, value: string) {
      const name = value.trim().replace(/\s+/g, ' ')
      const categories = this.categories[domain]
      if (
        !name ||
        !categories ||
        categories.some(
          (category) => category.toLocaleLowerCase('ru') === name.toLocaleLowerCase('ru'),
        )
      )
        return false
      categories.push(name)
      return true
    },
    removeCategory(domain: CategoryDomain, name: string) {
      if (defaultCategories[domain].includes(name) || !this.categories[domain].includes(name))
        return false
      this.categories[domain] = this.categories[domain].filter((category) => category !== name)
      return true
    },
    notify(message: string) {
      this.toast = message
      clearTimeout(notificationTimers.get(this))
      notificationTimers.set(
        this,
        setTimeout(() => {
          this.toast = ''
          notificationTimers.delete(this)
        }, 3500),
      )
    },
    copyChecklistToTrip(checklistId: string, tripId: string) {
      const source = this.checklists.find((list) => list.id === checklistId && !list.tripId)
      const trip = this.trips.find((trip) => trip.id === tripId)
      if (!source || !trip || trip.archived || !this.editable(tripId)) return

      const id = crypto.randomUUID()
      this.checklists.push({
        id,
        tripId,
        title: source.title,
        items: source.items.map((item) => ({
          id: crypto.randomUUID(),
          title: item.title,
          checked: false,
        })),
      })
      return id
    },
    addPlaceToTrip(placeId: string, tripId: string) {
      if (!this.editable(tripId) || !this.places.some((place) => place.id === placeId)) return false
      if (this.tripPlaces.some((link) => link.placeId === placeId && link.tripId === tripId))
        return false
      this.tripPlaces.push({ placeId, tripId })
      return true
    },
    removePlaceFromTrip(placeId: string, tripId: string) {
      if (!this.editable(tripId)) return
      this.tripPlaces = this.tripPlaces.filter(
        (link) => link.placeId !== placeId || link.tripId !== tripId,
      )
    },
    removePlace(placeId: string) {
      this.places = this.places.filter((place) => place.id !== placeId)
      this.tripPlaces = this.tripPlaces.filter((link) => link.placeId !== placeId)
    },
    moveEvent(eventId: string, targetId: string) {
      const event = this.events.find((item) => item.id === eventId)
      const target = this.events.find((item) => item.id === targetId)
      if (
        !event ||
        !target ||
        event === target ||
        event.tripId !== target.tripId ||
        event.day !== target.day ||
        !this.editable(event.tripId)
      )
        return false
      const dayEvents = this.events
        .filter((item) => item.tripId === event.tripId && item.day === event.day)
        .sort((a, b) => a.start.localeCompare(b.start))
      const timeSlots = dayEvents.map(({ start, end }) => ({ start, end }))
      const from = dayEvents.indexOf(event)
      const to = dayEvents.indexOf(target)
      dayEvents.splice(from, 1)
      dayEvents.splice(to, 0, event)

      // Cards change position; the day's time slots stay in place.
      dayEvents.forEach((item, index) => Object.assign(item, timeSlots[index]))
      let dayIndex = 0
      this.events = this.events.map((item) => {
        if (item.tripId !== event.tripId || item.day !== event.day) return item
        return dayEvents[dayIndex++]!
      })
      return true
    },
    swapEvents(firstId: string, secondId: string) {
      const firstIndex = this.events.findIndex((event) => event.id === firstId)
      const secondIndex = this.events.findIndex((event) => event.id === secondId)
      const first = this.events[firstIndex]
      const second = this.events[secondIndex]
      if (
        !first ||
        !second ||
        first === second ||
        first.tripId !== second.tripId ||
        first.day !== second.day ||
        !this.editable(first.tripId)
      )
        return false
      const time = { start: first.start, end: first.end }
      first.start = second.start
      first.end = second.end
      second.start = time.start
      second.end = time.end
      this.events[firstIndex] = second
      this.events[secondIndex] = first
      return true
    },
  },
})

export type TravelStore = ReturnType<typeof createTravelStore>

export function useTravelStore(...args: Parameters<typeof createTravelStore>) {
  const store = createTravelStore(...args)
  persistTravelStore(store)
  return store
}

useTravelStore.$id = createTravelStore.$id

import { defineStore } from 'pinia'
import {
  imageAssets,
  initialTrips,
  initialEvents,
  initialPlaces,
  initialTripPlaces,
  initialChecklists,
  initialParticipants,
  initialExpenses,
} from '@/data/trips.data'
import type {
  Trip,
  PlanEvent,
  Place,
  TripPlace,
  Checklist,
  Participant,
  Expense,
  Profile,
} from '@/types/trip.types'
function restore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`tripper:${key}`) ?? localStorage.getItem(`tripplan:${key}`)
    if (!raw) return structuredClone(fallback)
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed === null ||
      typeof parsed !== typeof fallback ||
      Array.isArray(parsed) !== Array.isArray(fallback)
    )
      return structuredClone(fallback)
    return parsed as T
  } catch {
    return structuredClone(fallback)
  }
}
const notificationTimers = new WeakMap<object, ReturnType<typeof setTimeout>>()

const createTravelStore = defineStore('travel', {
  state() {
    const trips = restore<Trip[]>('trips', initialTrips)
    const events = restore<PlanEvent[]>('events', initialEvents)
    const savedPlaces = restore<(Place & { tripId?: string; planned?: boolean })[]>(
      'places',
      initialPlaces.map((place) => ({
        ...place,
        tripId: initialTripPlaces.find((link) => link.placeId === place.id)?.tripId,
      })),
    )
    const legacyLinks = savedPlaces.flatMap((place) =>
      place.tripId ? [{ placeId: place.id, tripId: place.tripId }] : [],
    )
    const places: Place[] = savedPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      address: place.address,
      image: place.image,
      description: place.description,
    }))
    const tripPlaces = restore<TripPlace[]>('tripPlaces', legacyLinks).filter((link) =>
      places.some((place) => place.id === link.placeId),
    )
    const checklists = restore<Checklist[]>('checklists', initialChecklists)
    // Persisted asset URLs can change between development and production builds.
    for (const records of [trips, events, places]) {
      for (const record of records) {
        const match = Object.entries(imageAssets).find(([name]) => record.image.includes(name))
        if (match) record.image = match[1]
      }
    }
    const participants = restore<Participant[]>('participants', initialParticipants)
    const expenses = restore<Expense[]>('expenses', initialExpenses)
    const profile = restore<Profile>('profile', {
      name: 'Александр',
      email: 'alex@example.com',
      notifications: true,
    })
    const session = restore('session', false)
    return {
      trips,
      events,
      places,
      tripPlaces,
      checklists,
      participants,
      expenses,
      profile,
      session,
      toast: '',
      storageError: false,
    }
  },
  getters: {
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
      const events = this.events
        .filter((item) => item.tripId === event.tripId && item.day === event.day)
        .sort((a, b) => a.start.localeCompare(b.start))
      const slots = events.map((item) => ({ start: item.start, end: item.end }))
      const from = events.indexOf(event)
      const to = events.indexOf(target)
      events.splice(from, 1)
      events.splice(to, 0, event)
      events.forEach((item, index) => Object.assign(item, slots[index]))
      let index = 0
      this.events = this.events.map((item) =>
        item.tripId === event.tripId && item.day === event.day ? events[index++]! : item,
      )
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

const initializedStores = new WeakSet<object>()
const persistedKeys = [
  'trips',
  'events',
  'places',
  'tripPlaces',
  'checklists',
  'participants',
  'expenses',
  'profile',
  'session',
] as const

export const useTravelStore: typeof createTravelStore = Object.assign(
  (...args: Parameters<typeof createTravelStore>) => {
    const store = createTravelStore(...args)
    if (!initializedStores.has(store)) {
      initializedStores.add(store)
      const savedValues = new Map<string, string>()
      const persist = () => {
        for (const key of persistedKeys) {
          try {
            const value = JSON.stringify(store[key])
            if (savedValues.get(key) === value) continue
            localStorage.setItem(`tripper:${key}`, value)
            savedValues.set(key, value)
          } catch {
            store.storageError = true
          }
        }
      }
      persist()
      store.$subscribe(persist, { detached: true })
    }
    return store
  },
  { $id: createTravelStore.$id },
)

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  imageAssets,
  initialTrips,
  initialEvents,
  initialPlaces,
  initialChecklists,
  initialParticipants,
  initialExpenses,
} from '@/data/trips.data'
import type {
  Trip,
  PlanEvent,
  Place,
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
export const useTravelStore = defineStore('travel', () => {
  const trips = ref<Trip[]>(restore('trips', initialTrips))
  const events = ref<PlanEvent[]>(restore('events', initialEvents))
  const places = ref<Place[]>(restore('places', initialPlaces))
  const checklists = ref<Checklist[]>(restore('checklists', initialChecklists))
  // Persisted asset URLs can change between development and production builds.
  for (const records of [trips.value, events.value, places.value]) {
    for (const record of records) {
      const match = Object.entries(imageAssets).find(([name]) => record.image.includes(name))
      if (match) record.image = match[1]
    }
  }
  const participants = ref<Participant[]>(restore('participants', initialParticipants))
  const expenses = ref<Expense[]>(restore('expenses', initialExpenses))
  const profile = ref<Profile>(
    restore('profile', { name: 'Александр', email: 'alex@example.com', notifications: true }),
  )
  const session = ref(restore('session', false))
  const toast = ref('')
  const storageError = ref(false)
  let timer: ReturnType<typeof setTimeout>
  function notify(message: string) {
    toast.value = message
    clearTimeout(timer)
    timer = setTimeout(() => (toast.value = ''), 3500)
  }
  for (const [key, state] of Object.entries({
    trips,
    events,
    places,
    checklists,
    participants,
    expenses,
    profile,
    session,
  })) {
    watch(
      state,
      (value) => {
        try {
          localStorage.setItem(`tripper:${key}`, JSON.stringify(value))
        } catch {
          storageError.value = true
        }
      },
      { deep: true },
    )
  }
  function members(tripId: string) {
    return participants.value.filter((p) => p.tripId === tripId)
  }
  function editable(tripId: string) {
    return trips.value.find((t) => t.id === tripId)?.role === 'organizer'
  }
  return {
    trips,
    events,
    places,
    checklists,
    participants,
    expenses,
    profile,
    session,
    toast,
    storageError,
    notify,
    members,
    editable,
  }
})

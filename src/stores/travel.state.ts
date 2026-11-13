import {
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
import { restore } from './travel.storage'
import { readPasswordCredential } from '@/utils/password'
import { defaultCategories } from '@/data/categories.data'
import type { Categories, CategoryDomain } from '@/types/category.types'

function restoreImages<T extends { image: string }>(records: T[]): T[] {
  // Remove legacy stock covers while preserving uploaded and external photos.
  for (const record of records) {
    if (record.image.startsWith('data:')) continue
    const localAsset = /^\/(?:assets|src\/assets\/images)\//.test(record.image)
    const stock =
      localAsset &&
      /\/(?:florence|altai|petersburg|garden|gallery|food|coast)(?:-[^/]+)?\.jpg$/.test(
        record.image,
      )
    if (stock) record.image = ''
  }
  return records
}

function restoreTrips(): Trip[] {
  type StoredTrip = Omit<Trip, 'status'> & { status: Trip['status'] | 'completed' }
  const trips = restore<StoredTrip[]>('trips', initialTrips)

  return restoreImages(trips).map(({ status, ...trip }) => ({
    ...trip,
    status: status === 'completed' ? 'upcoming' : status,
    archived: trip.archived || status === 'completed',
  }))
}

function restorePlaces() {
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
    coordinates: place.coordinates,
    image: place.image,
    description: place.description,
  }))
  const tripPlaces = restore<TripPlace[]>('tripPlaces', legacyLinks).filter((link) =>
    places.some((place) => place.id === link.placeId),
  )
  return { places: restoreImages(places), tripPlaces }
}

export function createTravelState() {
  const { places, tripPlaces } = restorePlaces()
  const events = restoreImages(restore<PlanEvent[]>('events', initialEvents))
  const expenses = restore<Expense[]>('expenses', initialExpenses)
  const saved = restore<Partial<Categories>>('categories', {})
  const categories = structuredClone(defaultCategories)
  for (const event of events) delete (event as PlanEvent & { category?: string }).category
  const records = { places, expenses }
  for (const domain of Object.keys(categories) as CategoryDomain[]) {
    // A saved list is authoritative: deleted categories must not return from older records.
    const stored = Array.isArray(saved[domain])
      ? saved[domain]
      : records[domain].map((record) => record.category)
    for (const value of stored) {
      if (typeof value !== 'string') continue
      const name = value.trim().replace(/\s+/g, ' ')
      if (
        name &&
        !categories[domain].some(
          (category) => category.toLocaleLowerCase('ru') === name.toLocaleLowerCase('ru'),
        )
      )
        categories[domain].push(name)
    }
  }

  return {
    trips: restoreTrips(),
    events,
    categories,
    places,
    tripPlaces,
    checklists: restore<Checklist[]>('checklists', initialChecklists),
    participants: restore<Participant[]>('participants', initialParticipants),
    expenses,
    profile: restore<Profile>('profile', {
      name: 'Александр',
      email: 'alex@example.com',
      notifications: true,
    }),
    session: restore('session', false),
    passwordCredential: readPasswordCredential(),
    toast: '',
    storageError: false,
  }
}

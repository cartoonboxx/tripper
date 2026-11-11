import type { TravelStore } from './travel'

export function restore<T>(key: string, fallback: T): T {
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

const initializedStores = new WeakSet<object>()
const persistedKeys = [
  'trips',
  'events',
  'places',
  'tripPlaces',
  'checklists',
  'participants',
  'expenses',
  'categories',
  'profile',
  'session',
] as const

export function persistTravelStore(store: TravelStore) {
  if (initializedStores.has(store)) return
  initializedStores.add(store)
  const savedValues = new Map<string, string>()
  const persist = () => {
    for (const key of persistedKeys) {
      try {
        const value = JSON.stringify(store.$state[key])
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

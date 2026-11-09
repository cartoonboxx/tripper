import type { Trip } from '@/types/trip.types'
export interface TripFormProps {
  open: boolean
  trip?: Trip
}

export interface TripFormEmits {
  close: []
}

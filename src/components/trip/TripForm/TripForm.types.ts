import type { Trip } from '@/types/trip.types.ts'
export interface TripFormProps {
  open: boolean
  trip?: Trip
}

export interface TripFormEmits {
  close: []
}

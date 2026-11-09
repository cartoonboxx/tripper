import type { PlanEvent } from '@/types/trip.types'
export interface EventFormProps {
  open: boolean
  tripId: string
  day: string
  event?: PlanEvent
}

export interface EventFormEmits {
  close: []
}

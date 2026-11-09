import type { PropType } from 'vue'
import type { TripCardProps } from './TripCard.types'
export const componentProps = {
  trip: { type: Object as PropType<TripCardProps['trip']>, required: true as const },
}

import type { PropType } from 'vue'
import type { TripFormProps } from './TripForm.types.ts'
export const componentProps = {
  open: { type: Boolean as PropType<TripFormProps['open']>, required: true as const },
  trip: { type: Object as PropType<TripFormProps['trip']> },
}

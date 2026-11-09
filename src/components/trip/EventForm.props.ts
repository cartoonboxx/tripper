import type { PropType } from 'vue'
import type { EventFormProps } from './EventForm.types'
export const componentProps = {
  open: { type: Boolean as PropType<EventFormProps['open']>, required: true as const },
  tripId: { type: String as PropType<EventFormProps['tripId']>, required: true as const },
  day: { type: String as PropType<EventFormProps['day']>, required: true as const },
  event: { type: Object as PropType<EventFormProps['event']> },
}

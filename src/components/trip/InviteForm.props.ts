import type { PropType } from 'vue'
import type { InviteFormProps } from './InviteForm.types'
export const componentProps = {
  open: { type: Boolean as PropType<InviteFormProps['open']>, required: true as const },
  tripId: { type: String as PropType<InviteFormProps['tripId']>, required: true as const },
}

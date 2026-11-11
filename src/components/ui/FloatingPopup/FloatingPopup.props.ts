import type { PropType } from 'vue'
import type { FloatingPopupProps } from './FloatingPopup.types'

export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  fullWidth: { type: Boolean, default: false },
  matchWidth: { type: Boolean, default: false },
  open: { type: Boolean as PropType<FloatingPopupProps['open']>, default: false },
  label: { type: String as PropType<FloatingPopupProps['label']>, default: 'Действия' },
  placement: {
    type: String as PropType<FloatingPopupProps['placement']>,
    default: 'bottom-start',
  },
}

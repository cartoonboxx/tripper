import type { PropType } from 'vue'
import type { ModalProps } from './Modal.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  open: { type: Boolean as PropType<ModalProps['open']>, required: true as const },
  title: { type: String as PropType<ModalProps['title']>, required: true as const },
  wide: { type: Boolean as PropType<ModalProps['wide']> },
}

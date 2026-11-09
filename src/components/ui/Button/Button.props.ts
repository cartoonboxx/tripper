import type { PropType } from 'vue'
import type { ButtonProps } from './Button.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  to: { type: String as PropType<ButtonProps['to']> },
  variant: { type: String as PropType<ButtonProps['variant']> },
  size: { type: String as PropType<ButtonProps['size']> },
  disabled: { type: Boolean as PropType<ButtonProps['disabled']> },
  type: { type: String as PropType<ButtonProps['type']> },
  iconOnly: { type: Boolean as PropType<ButtonProps['iconOnly']> },
}

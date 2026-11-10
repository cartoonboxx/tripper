import type { PropType } from 'vue'
import type { ButtonProps } from './Button.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  to: { type: String as PropType<ButtonProps['to']> },
  variant: { type: String as PropType<ButtonProps['variant']>, default: 'primary' },
  size: { type: String as PropType<ButtonProps['size']>, default: 'md' },
  disabled: { type: Boolean as PropType<ButtonProps['disabled']> },
  type: { type: String as PropType<ButtonProps['type']>, default: 'button' },
  iconOnly: { type: Boolean as PropType<ButtonProps['iconOnly']> },
}

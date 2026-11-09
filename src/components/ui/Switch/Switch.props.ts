import type { PropType } from 'vue'
import type { SwitchProps } from './Switch.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  modelValue: { type: Boolean as PropType<SwitchProps['modelValue']> },
  label: { type: String as PropType<SwitchProps['label']> },
  disabled: { type: Boolean as PropType<SwitchProps['disabled']> },
}

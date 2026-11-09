import type { PropType } from 'vue'
import type { CheckboxProps } from './Checkbox.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  modelValue: { type: Boolean as PropType<CheckboxProps['modelValue']> },
  label: { type: String as PropType<CheckboxProps['label']> },
  disabled: { type: Boolean as PropType<CheckboxProps['disabled']> },
}

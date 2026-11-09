import type { PropType } from 'vue'
import type { SelectProps } from './Select.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  modelValue: { type: String as PropType<SelectProps['modelValue']> },
  label: { type: String as PropType<SelectProps['label']>, default: '' },
  options: { type: Array as PropType<SelectProps['options']>, required: true as const },
  disabled: { type: Boolean as PropType<SelectProps['disabled']> },
  required: { type: Boolean as PropType<SelectProps['required']> },
}

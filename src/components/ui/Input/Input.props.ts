import type { PropType } from 'vue'
import type { InputProps } from './Input.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  modelValue: { type: [String, Number] as PropType<InputProps['modelValue']> },
  size: { type: String as PropType<InputProps['size']>, default: 'md' },
  label: { type: String as PropType<InputProps['label']>, default: '' },
  placeholder: { type: String as PropType<InputProps['placeholder']> },
  type: { type: String as PropType<InputProps['type']>, default: 'text' },
  rows: { type: Number as PropType<InputProps['rows']>, default: 4 },
  required: { type: Boolean as PropType<InputProps['required']> },
  disabled: { type: Boolean as PropType<InputProps['disabled']> },
  error: { type: String as PropType<InputProps['error']> },
  min: { type: [String, Number] as PropType<InputProps['min']> },
  max: { type: [String, Number] as PropType<InputProps['max']> },
  autocomplete: { type: String as PropType<InputProps['autocomplete']> },
}

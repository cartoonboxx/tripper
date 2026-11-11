import type { InputProps } from '../Input/Input.types'

export interface DateTimePickerProps extends Omit<InputProps, 'type'> {
  type?: 'date' | 'time'
}

export interface DateTimePickerEmits {
  'update:modelValue': [value: string]
}

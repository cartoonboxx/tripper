export interface InputProps {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  error?: string
  min?: string | number
  max?: string | number
  autocomplete?: string
}

export interface InputEmits {
  'update:modelValue': [value: string]
}

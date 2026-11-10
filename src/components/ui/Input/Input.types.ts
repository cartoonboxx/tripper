export interface InputProps {
  modelValue?: string | number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  placeholder?: string
  type?: string
  rows?: number
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

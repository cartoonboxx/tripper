export interface SelectProps {
  modelValue?: string
  label?: string
  options: { label: string; value: string }[]
  disabled?: boolean
  required?: boolean
}

export interface SelectEmits {
  'update:modelValue': [value: string]
}

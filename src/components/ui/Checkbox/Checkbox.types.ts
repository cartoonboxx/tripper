export interface CheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

export interface CheckboxEmits {
  'update:modelValue': [value: boolean]
}

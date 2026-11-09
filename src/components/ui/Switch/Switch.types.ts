export interface SwitchProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

export interface SwitchEmits {
  'update:modelValue': [value: boolean]
}

export interface FloatingPopupProps {
  open?: boolean
  matchWidth?: boolean
  fullWidth?: boolean
  label?: string
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}

export interface FloatingPopupEmits {
  'update:open': [open: boolean]
  close: []
}

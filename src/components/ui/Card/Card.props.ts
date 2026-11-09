import type { PropType } from 'vue'
import type { CardProps } from './Card.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  interactive: { type: Boolean as PropType<CardProps['interactive']> },
}

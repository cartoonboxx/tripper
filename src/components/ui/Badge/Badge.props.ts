import type { PropType } from 'vue'
import type { BadgeProps } from './Badge.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  variant: { type: String as PropType<BadgeProps['variant']>, default: 'green' },
}

import type { PropType } from 'vue'
import type { TabProps } from './Tab.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  active: { type: Boolean as PropType<TabProps['active']> },
  variant: { type: String as PropType<TabProps['variant']>, default: 'pill' },
  disabled: { type: Boolean as PropType<TabProps['disabled']> },
}

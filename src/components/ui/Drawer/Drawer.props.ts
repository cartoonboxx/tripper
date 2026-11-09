import type { PropType } from 'vue'
import type { DrawerProps } from './Drawer.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  open: { type: Boolean as PropType<DrawerProps['open']>, required: true as const },
  title: { type: String as PropType<DrawerProps['title']>, required: true as const },
}

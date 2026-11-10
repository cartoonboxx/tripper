import type { PropType } from 'vue'
import type { AvatarProps } from './Avatar.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  name: { type: String as PropType<AvatarProps['name']> },
  size: { type: String as PropType<AvatarProps['size']>, default: 'md' },
  color: { type: String as PropType<AvatarProps['color']> },
}

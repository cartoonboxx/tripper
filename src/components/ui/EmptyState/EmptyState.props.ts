import type { PropType } from 'vue'
import type { EmptyStateProps } from './EmptyState.types'
export const componentProps = {
  appearance: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  title: { type: String as PropType<EmptyStateProps['title']>, required: true as const },
  description: { type: String as PropType<EmptyStateProps['description']> },
  icon: { type: [Object, Function] as PropType<EmptyStateProps['icon']> },
}

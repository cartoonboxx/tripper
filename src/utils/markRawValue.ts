import { markRaw } from 'vue'
export function markRawValue<T>(value: T): T {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
    ? markRaw(value)
    : value
}

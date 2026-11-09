let counter = 0
export function createId(prefix = 'field'): string {
  counter += 1
  return `tripper-${prefix}-${counter}`
}

export function mergeStyles(
  ...modules: Readonly<Record<string, string>>[]
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const module of modules) {
    for (const [name, value] of Object.entries(module)) {
      const previous = result[name]
      result[name] = previous && previous !== value ? `${previous} ${value}` : value
    }
  }
  return result
}

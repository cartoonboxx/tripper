export function parseDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day, 12)
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day)
    return date
}

export function dateValue(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function monthDays(year: number, month: number) {
  const first = new Date(year, month, 1, 12)
  const offset = (first.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - offset + 1, 12)
    return { value: dateValue(date), day: date.getDate(), outside: date.getMonth() !== month }
  })
}

export function timeAllowed(value: string, min: string, max: string): boolean {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false
  if (min && max && min > max) return value >= min || value <= max
  return (!min || value >= min) && (!max || value <= max)
}

export function parseDateInput(value: string): string | undefined {
  if (parseDate(value)) return value
  const match = /^(\d{2})[./]?(\d{2})[./]?(\d{4})$/.exec(value)
  if (!match) return
  const iso = `${match[3]}-${match[2]}-${match[1]}`
  if (parseDate(iso)) return iso
}

export function formatDateInput(value: string): string {
  const date = parseDate(value)
  if (!date) return value
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).padStart(4, '0')}`
}

export function parseTimeInput(value: string): string | undefined {
  const time = /^\d{4}$/.test(value) ? `${value.slice(0, 2)}:${value.slice(2)}` : value
  if (timeAllowed(time, '', '')) return time
}

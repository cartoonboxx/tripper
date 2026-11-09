export function shortDate(value: string) {
  return new Date(value + 'T12:00:00')
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    .replace(' г.', '')
}
export function dateRange(start: string, end: string) {
  return `${shortDate(start)} — ${shortDate(end)} ${new Date(end).getFullYear()}`
}
export function money(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}
export function tripDays(start: string, end: string) {
  const days: string[] = []
  const date = new Date(start + 'T12:00:00')
  const last = new Date(end + 'T12:00:00')
  while (date <= last && days.length < 366) {
    days.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    )
    date.setDate(date.getDate() + 1)
  }
  return days
}
export function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

import type { OverlayController } from './overlay.types'
const stack: symbol[] = []
export function createOverlayController(
  element: () => HTMLElement | undefined,
  close: () => void,
  native = false,
): OverlayController {
  const token = Symbol()
  let previous: HTMLElement | null = null
  let opened = false
  function keydown(event: KeyboardEvent) {
    if (stack[stack.length - 1] !== token) return
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const panel = element()
    const items = panel?.querySelectorAll<HTMLElement>(
      'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]',
    )
    if (!items?.length) {
      event.preventDefault()
      return
    }
    const first = items[0],
      last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault()
      last?.focus({ preventScroll: true })
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus({ preventScroll: true })
    }
  }
  return {
    open() {
      if (opened) return
      opened = true
      previous = document.activeElement as HTMLElement
      stack.push(token)
      document.body.style.overflow = 'hidden'
      if (!native) {
        document.addEventListener('keydown', keydown)
        element()
          ?.querySelector<HTMLElement>('button, input, select, textarea, a[href]')
          ?.focus({ preventScroll: true })
      }
    },
    close() {
      if (!opened) return
      opened = false
      const index = stack.indexOf(token)
      if (index >= 0) stack.splice(index, 1)
      document.removeEventListener('keydown', keydown)
      if (!stack.length) document.body.style.overflow = ''
      previous?.focus({ preventScroll: true })
    },
  }
}

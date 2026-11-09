import style from '@/styles/pressFeedback.module.scss'

export function installPressFeedback(): () => void {
  let pressed: HTMLElement | null = null
  let originX = 0
  let originY = 0
  let started = 0
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()
  function release(immediate = false) {
    const element = pressed
    pressed = null
    if (!element) return
    const delay = immediate ? 0 : Math.max(0, 100 - (performance.now() - started))
    timers.set(
      element,
      setTimeout(() => {
        element.classList.remove(style.isPressed!)
        timers.set(
          element,
          setTimeout(() => {
            element.classList.remove(style.pressTarget!)
            timers.delete(element)
          }, 240),
        )
      }, delay),
    )
  }
  function down(event: PointerEvent) {
    if (event.pointerType === 'mouse') return
    const target = (event.target as Element).closest<HTMLElement>(
      'button:not(:disabled), a[href], label:has(input:not(:disabled))',
    )
    if (!target) return
    release(true)
    clearTimeout(timers.get(target))
    timers.delete(target)
    pressed = target
    started = performance.now()
    originX = event.clientX
    originY = event.clientY
    target.classList.add(style.pressTarget!, style.isPressed!)
  }
  function move(event: PointerEvent) {
    if (Math.hypot(event.clientX - originX, event.clientY - originY) > 8) release(true)
  }
  function up() {
    release()
  }
  function cancel() {
    release(true)
  }
  document.addEventListener('pointerdown', down, { passive: true })
  document.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerup', up, { passive: true })
  document.addEventListener('pointercancel', cancel, { passive: true })
  document.addEventListener('scroll', cancel, { passive: true, capture: true })
  window.addEventListener('blur', cancel)
  return () => {
    release(true)
    document.removeEventListener('pointerdown', down)
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', up)
    document.removeEventListener('pointercancel', cancel)
    document.removeEventListener('scroll', cancel, true)
    window.removeEventListener('blur', cancel)
    timers.forEach((timer, element) => {
      clearTimeout(timer)
      element.classList.remove(style.pressTarget!, style.isPressed!)
    })
    timers.clear()
  }
}

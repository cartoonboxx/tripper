import { expect, test } from '@playwright/test'

for (const width of [1440, 375]) {
  test(`drawer slides from the right without scrolling its overlay at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui-kit')
    await page.addStyleTag({ content: ':root { --motion-modal-enter: 600ms; }' })
    const frames = await page
      .getByRole('button', { name: 'Открыть Drawer', exact: true })
      .evaluate(async (opener) => {
        opener.click()
        const frames: { x: number; width: number; scroll: number; opacity: string }[] = []
        const start = performance.now()
        while (performance.now() - start < 750) {
          await new Promise(requestAnimationFrame)
          const dialog = document.querySelector('dialog')!
          const rect = dialog.getBoundingClientRect()
          frames.push({
            x: rect.x,
            width: rect.width,
            scroll: dialog.parentElement!.scrollLeft,
            opacity: getComputedStyle(dialog).opacity,
          })
        }
        return frames
      })
    const finalX = width - frames[frames.length - 1]!.width
    expect(frames.some((frame) => frame.x > finalX + 10)).toBe(true)
    expect(
      frames.every((frame) => frame.scroll === 0 && frame.x >= finalX - 1 && frame.opacity === '1'),
    ).toBe(true)
    expect(frames[frames.length - 1]!.x).toBeCloseTo(finalX, 0)
    await expect(page.getByRole('dialog').getByRole('button').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
}

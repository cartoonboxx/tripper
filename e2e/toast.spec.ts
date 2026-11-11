import { expect, test } from '@playwright/test'

for (const width of [1440, 375]) {
  test(`notifications appear above an open modal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async () => {} },
        configurable: true,
      })
    })
    await page.goto('/trips/florence/participants')
    await page.getByRole('button', { name: 'Пригласить участников', exact: true }).click()
    const dialog = page.getByRole('dialog')
    const copy = dialog.getByRole('button', { name: 'Скопировать ссылку', exact: true })
    await copy.focus()
    await copy.press('Enter')
    const toast = page.locator('[popover="manual"]')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Ссылка скопирована')
    await expect(toast).toHaveJSProperty('popover', 'manual')
    expect(await toast.evaluate((element) => element.matches(':popover-open'))).toBe(true)
    await expect(dialog).toBeVisible()
    await expect(copy).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(toast).toBeVisible()
    await page.getByRole('button', { name: 'Пригласить участников', exact: true }).click()
    await expect(dialog).toBeVisible()
    expect(await toast.evaluate((element) => element.matches(':popover-open'))).toBe(true)
    await expect(toast).toBeHidden({ timeout: 5000 })
    await expect(dialog).toBeVisible()
  })
}

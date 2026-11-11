import { expect, test, type Locator, type Page } from '@playwright/test'

const cases = [
  {
    name: 'event',
    route: '/trips/florence/plan',
    storageKey: 'tripper:events',
    opener: (page: Page) => page.locator('article').first().locator('button').first(),
  },
  {
    name: 'place',
    route: '/places',
    storageKey: 'tripper:places',
    opener: (page: Page) => page.getByRole('button', { name: 'Сады Боболи', exact: true }).last(),
  },
]

async function expectAnchored(footer: Locator) {
  await expect(footer).toBeVisible()
  const anchored = await footer.evaluate((element) => {
    const panel = element.closest('dialog')!
    return (
      Math.abs(
        panel.getBoundingClientRect().bottom -
          parseFloat(getComputedStyle(panel).paddingBottom) -
          element.getBoundingClientRect().bottom,
      ) < 2
    )
  })
  expect(anchored).toBe(true)
}

for (const width of [1440, 375]) {
  for (const scenario of cases) {
    test(`${scenario.name} drawer actions stay at the bottom while long content scrolls at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(scenario.route)
      await scenario.opener(page).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toHaveCSS('transform', 'none')
      const footer = dialog.locator('footer')
      await expectAnchored(footer)
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await page.evaluate((key) => {
        const records = JSON.parse(localStorage.getItem(key)!)
        for (const record of records)
          record.description = 'Длинная заметка о путешествии. '.repeat(1000)
        localStorage.setItem(key, JSON.stringify(records))
      }, scenario.storageKey)
      await page.reload()
      await scenario.opener(page).click()
      await expect(dialog).toHaveCSS('transform', 'none')
      await expectAnchored(footer)
      const before = (await footer.boundingBox())!
      const scrolled = await footer.evaluate((element) => {
        const body = element.previousElementSibling as HTMLElement
        body.scrollTop = body.scrollHeight
        return body.scrollTop > 0
      })
      expect(scrolled).toBe(true)
      const after = (await footer.boundingBox())!
      expect(Math.abs(before.y - after.y)).toBeLessThan(1)
      await expect(footer.getByRole('button').first()).toBeInViewport()
    })
  }

  test(`UI kit drawer exposes a footer anchored at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui-kit')
    await page.getByRole('button', { name: 'Открыть Drawer', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveCSS('transform', 'none')
    await expectAnchored(dialog.locator('footer'))
    await dialog.locator('footer').getByRole('button', { name: 'Готово', exact: true }).click()
    await expect(dialog).toHaveCount(0)
  })
}

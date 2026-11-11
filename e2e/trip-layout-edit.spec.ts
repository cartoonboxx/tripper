import { expect, test } from '@playwright/test'

for (const width of [1440, 375, 320]) {
  test(`editing a trip keeps the current page and background at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) =>
            failure({ code: 1 } as GeolocationPositionError),
        },
      })
    })
    for (const section of ['today', 'plan', 'checklists', 'expenses']) {
      const route = `/trips/florence/${section}`
      await page.goto(route)
      const edit = page.getByRole('button', { name: 'Редактировать поездку', exact: true })
      await edit.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByLabel(/^Название поездки/)).toHaveValue('Флоренция')
      await expect(page).toHaveURL(route)
      await expect(page.locator('main h1')).toHaveText('Флоренция')
      await expect(
        page.locator('main').getByText('ВАШЕ ПУТЕШЕСТВИЕ', { exact: false }),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(edit).toBeFocused()
      await expect(page).toHaveURL(route)
      await edit.click()
      await dialog.getByLabel('Заметки о поездке').fill(`Заметка из ${section}`)
      await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(page).toHaveURL(route)
      await expect(edit).toBeFocused()
      expect(
        await page.evaluate(() => {
          const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
          return trips.find((trip: { id: string }) => trip.id === 'florence').notes
        }),
      ).toBe(`Заметка из ${section}`)
    }
    await page.goto('/trips/florence/today')
    await expect(page.getByRole('heading', { name: 'Расходы поездки', exact: true })).toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: 'Чек-листы поездки', exact: true }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Расходы', exact: true }).last().click()
    await expect(page).toHaveURL('/trips/florence/expenses')
    await expect(page.getByRole('heading', { name: 'Расходы поездки', exact: true })).toBeVisible()
  })
}

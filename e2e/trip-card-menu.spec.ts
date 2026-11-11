import { expect, test } from '@playwright/test'

for (const width of [1440, 375, 320]) {
  test(`trip card menu edits, archives and restores at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/trips')
    const card = page
      .locator('main')
      .getByAltText('Флоренция', { exact: true })
      .locator('..')
      .locator('..')
    const popup = card.locator('[popover]')
    const trigger = popup.locator('..').getByRole('button').first()
    await trigger.focus()
    await trigger.press('Enter')
    await expect(popup.getByRole('button', { name: 'Редактировать', exact: true })).toBeFocused()
    await expect(popup).toHaveCSS('border-radius', '8px')
    await expect(popup).toHaveCSS('padding', '0px')
    const bounds = await popup.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(width <= 600 ? 824 : 900)
    await page.keyboard.press('Escape')
    await expect(popup).toBeHidden()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.getByRole('heading', { name: 'Мои поездки', exact: true }).click()
    await expect(popup).toBeHidden()
    await trigger.click()
    await popup.getByRole('button', { name: 'Редактировать', exact: true }).click()
    await expect(page).toHaveURL('/trips')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.locator('main h1')).toHaveText('Мои поездки')
    await expect(card.getByAltText('Флоренция', { exact: true })).toBeVisible()
    await expect(popup).toBeHidden()
    await expect(dialog.getByLabel(/^Название поездки/)).toHaveValue('Флоренция')
    await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL('/trips')
    await expect(trigger).toBeFocused()
    await trigger.click()
    await popup.getByRole('button', { name: 'Редактировать', exact: true }).click()
    await dialog.getByLabel('Заметки о поездке', { exact: true }).fill('Изменено из карточки')
    await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL('/trips')
    await expect(trigger).toBeFocused()
    expect(
      await page.evaluate(() => {
        const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
        return trips.find((trip: { id: string }) => trip.id === 'florence').notes
      }),
    ).toBe('Изменено из карточки')
    await trigger.click()
    await popup.getByRole('button', { name: 'В архив', exact: true }).click()
    await expect(popup).toHaveCount(0)
    await expect(page.locator('[popover="manual"]')).toHaveText('Поездка в архиве')
    await page.goto('/archive')
    await trigger.click()
    await popup.getByRole('button', { name: 'Восстановить', exact: true }).click()
    await expect(popup).toHaveCount(0)
    await page.goto('/trips')
    await page.reload()
    await expect(trigger).toBeVisible()
  })
}

test('opening another trip menu closes the previous one and viewer trips have no menu', async ({
  page,
}) => {
  await page.goto('/trips')
  const menus = page.locator('main [popover]')
  await menus.nth(0).locator('..').getByRole('button').first().click()
  await expect(menus.nth(0)).toBeVisible()
  await menus.nth(1).locator('..').getByRole('button').first().click()
  await expect(menus.nth(1)).toBeVisible()
  await expect(menus.nth(0)).toBeHidden()
  await page.evaluate(() => {
    const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
    trips.find((trip: { id: string }) => trip.id === 'florence').role = 'viewer'
    localStorage.setItem('tripper:trips', JSON.stringify(trips))
  })
  await page.reload()
  const florenceTitle = page.getByRole('heading', { name: 'Флоренция', exact: true })
  await expect(
    florenceTitle.locator('..').locator('..').locator('..').locator('[popover]'),
  ).toHaveCount(0)
})

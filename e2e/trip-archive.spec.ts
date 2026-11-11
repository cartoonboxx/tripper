import { expect, test } from '@playwright/test'

for (const width of [1440, 375]) {
  test(`completed trips migrate to the archive and can be restored at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/trips')
    await page.evaluate(() => {
      const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
      const trip = trips.find((item: { id: string }) => item.id === 'petersburg')
      trip.status = 'completed'
      trip.archived = false
      localStorage.setItem('tripper:trips', JSON.stringify(trips))
    })
    await page.reload()
    await expect(page.getByRole('button', { name: 'Завершённые', exact: true })).toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: 'Выходные в Петербурге', exact: true }),
    ).toHaveCount(0)
    const florence = page.getByAltText('Флоренция', { exact: true }).locator('..').locator('..')
    await florence.locator('[popover]').locator('..').getByRole('button').first().click()
    await florence.getByRole('button', { name: 'Редактировать', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByLabel('Статус поездки').locator('option')).toHaveText([
      'Предстоящая',
      'Активная',
    ])
    await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await page.goto('/archive')
    const card = page
      .getByAltText('Выходные в Петербурге', { exact: true })
      .locator('..')
      .locator('..')
    await expect(card.getByText('В архиве', { exact: true })).toBeVisible()
    const popup = card.locator('[popover]')
    const trigger = popup.locator('..').getByRole('button').first()
    await trigger.click()
    await popup.getByRole('button', { name: 'Редактировать', exact: true }).click()
    await expect(dialog.getByLabel('Статус поездки')).toHaveCount(0)
    await dialog.getByLabel('Заметки о поездке').fill('Воспоминания о Петербурге')
    await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(card.getByText('В архиве', { exact: true })).toBeVisible()
    await page.goto('/trips/petersburg/plan')
    await expect(page.getByText('В архиве', { exact: true })).toBeVisible()
    await page.goto('/archive')
    await trigger.click()
    await popup.getByRole('button', { name: 'Восстановить', exact: true }).click()
    await expect(card).toHaveCount(0)
    await page.goto('/trips')
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Выходные в Петербурге', exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(() => {
        const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
        return trips.find((trip: { id: string }) => trip.id === 'petersburg')
      }),
    ).toMatchObject({ archived: false, status: 'upcoming', notes: 'Воспоминания о Петербурге' })
  })
}

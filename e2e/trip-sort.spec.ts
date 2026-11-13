import { expect, test } from '@playwright/test'

test('trips follow start dates after editing, filtering and reloading', async ({ page }) => {
  await page.goto('/trips')
  await page.evaluate(() => {
    const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
    trips.find((trip: { id: string }) => trip.id === 'florence').start = '2027-03-01'
    trips.find((trip: { id: string }) => trip.id === 'florence').end = '2027-03-05'
    trips.find((trip: { id: string }) => trip.id === 'altai').start = '2027-01-01'
    trips.find((trip: { id: string }) => trip.id === 'altai').end = '2027-01-05'
    localStorage.setItem('tripper:trips', JSON.stringify(trips))
  })
  await page.reload()
  const titles = page.getByRole('link').getByRole('heading', { level: 3 })
  await expect(titles).toHaveText(['Большое путешествие на Алтай', 'Флоренция'])
  await page.goto('/trips/florence/edit')
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Начало поездки').fill('2026-12-01')
  await dialog.getByLabel('Конец поездки').fill('2026-12-05')
  await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await page.goto('/trips')
  await expect(titles).toHaveText(['Флоренция', 'Большое путешествие на Алтай'])
  await page.getByRole('button', { name: 'Предстоящие', exact: true }).click()
  await expect(titles).toHaveText(['Флоренция', 'Большое путешествие на Алтай'])
  await page.reload()
  await expect(titles).toHaveText(['Флоренция', 'Большое путешествие на Алтай'])
})

import { expect, test } from '@playwright/test'

test('event details show the attached place category and the event form has no category', async ({
  page,
}) => {
  await page.goto('/trips/florence/plan')
  await page.evaluate(() => {
    const events = JSON.parse(localStorage.getItem('tripper:events')!)
    events[0].placeId = 'p1'
    events[0].place = 'Сады Боболи'
    events[0].category = 'Старая категория'
    localStorage.setItem('tripper:events', JSON.stringify(events))
  })
  await page.reload()
  const article = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Галерея Уффици', exact: true }) })
  await expect(article.getByText('Парк', { exact: true })).toBeVisible()
  await article.getByRole('button').first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Парк', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Старая категория', { exact: true })).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Редактировать', exact: true }).click()
  const form = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Редактирование', exact: true }) })
  await expect(form.getByLabel('Категория события', { exact: true })).toHaveCount(0)
  await form.getByRole('button', { name: 'Отмена', exact: true }).click()
  await page.evaluate(() => {
    const places = JSON.parse(localStorage.getItem('tripper:places')!)
    places.find((place: { id: string; category: string }) => place.id === 'p1').category =
      'Смотровая площадка'
    localStorage.setItem('tripper:places', JSON.stringify(places))
  })
  await page.goto('/trips/florence/events/e1')
  await expect(page.getByText('Смотровая площадка', { exact: true })).toBeVisible()
})

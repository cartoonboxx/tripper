import { expect, test } from '@playwright/test'

test('places combine category and search filters, support custom categories and reset empty results', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const common = { address: '', description: '', image: '' }
    localStorage.setItem(
      'tripper:places',
      JSON.stringify([
        { ...common, id: 'park', name: 'Зелёный парк', category: 'Парк' },
        { ...common, id: 'garden', name: 'Зелёный сад', category: 'Галерея' },
        { ...common, id: 'museum', name: 'Исторический музей', category: 'Музей' },
      ]),
    )
    localStorage.setItem('tripper:categories', JSON.stringify({ places: ['Парк', 'Музей'] }))
  })
  await page.goto('/places')
  const category = page.getByRole('combobox', { name: 'Категория места', exact: true })
  const search = page.getByRole('textbox', { name: 'Поиск мест', exact: true })
  await search.fill('  зЕЛЁНЫЙ  ')
  await category.selectOption('Парк')
  await expect(page.getByRole('button', { name: 'Зелёный парк', exact: true }).last()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Зелёный сад', exact: true })).toHaveCount(0)
  await category.selectOption('Галерея')
  await expect(page.getByRole('button', { name: 'Зелёный сад', exact: true }).last()).toBeVisible()
  await category.selectOption('Музей')
  await expect(page.getByRole('heading', { name: 'Места не найдены', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(category).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Исторический музей', exact: true }).last(),
  ).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  await category.click()
  await page.getByRole('button', { name: 'Парк', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Зелёный парк', exact: true }).last()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

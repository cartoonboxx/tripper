import { expect, test } from '@playwright/test'

test('custom categories persist and are available in all related forms and expense filters', async ({
  page,
}) => {
  await page.goto('/settings')
  for (const [domain, name] of [
    ['Категории расходов', 'Страховка'],
    ['Категории мест', 'Галерея'],
    ['Категории событий', 'Концерт'],
  ]) {
    const block = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: domain!, exact: true }) })
    await block.getByLabel(/^Новая категория/).fill(name!)
    await block.getByRole('button', { name: 'Добавить', exact: true }).click()
    await expect(page.getByText(name!, { exact: true })).toBeVisible()
  }
  const eventsBlock = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Категории событий', exact: true }) })
  await eventsBlock.getByLabel(/^Новая категория/).fill(' концерт ')
  await eventsBlock.getByRole('button', { name: 'Добавить', exact: true }).click()
  await expect(page.getByText('Такая категория уже существует.')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Концерт', { exact: true })).toBeVisible()
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Частная галерея')
  await dialog.getByLabel('Категория', { exact: true }).selectOption('Галерея')
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Галерея', { exact: true })).toBeVisible()
  await page.goto('/trips/altai/expenses')
  await page.getByRole('button', { name: 'Добавить расход', exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Полис для Алтая')
  await dialog.getByLabel(/^Сумма, ₽/).fill('750')
  await dialog.getByLabel('Категория', { exact: true }).selectOption('Страховка')
  await dialog.getByRole('button', { name: 'Добавить', exact: true }).click()
  await page.getByLabel('Категории', { exact: true }).selectOption('Страховка')
  await expect(page.getByText('Полис для Алтая', { exact: true })).toBeVisible()
  await page.goto('/trips/florence/expenses')
  await expect(page.getByText('Полис для Алтая', { exact: true })).toHaveCount(0)
  await page.goto('/trips/florence/plan')
  const tripNavigation = page
    .getByRole('navigation')
    .filter({ has: page.getByRole('link', { name: 'Сегодня', exact: true }) })
  await expect(tripNavigation.getByRole('link', { name: 'Места', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByLabel('Категория события', { exact: true })
    .selectOption('Концерт')
  await expect(
    page.getByRole('dialog').getByLabel('Категория события', { exact: true }),
  ).toHaveValue('Концерт')
})

test('each category block deletes only custom categories and preserves existing records', async ({
  page,
}) => {
  await page.goto('/settings')
  await expect(page.getByRole('combobox', { name: 'Раздел категорий' })).toHaveCount(0)
  for (const heading of ['Категории расходов', 'Категории мест', 'Категории событий']) {
    const block = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: heading, exact: true }) })
    await expect(block.getByRole('button', { name: 'Удалить', exact: true })).toHaveCount(0)
    await block.getByLabel(/^Новая категория/).fill('Своя категория')
    await block.getByRole('button', { name: 'Добавить', exact: true }).click()
    await expect(block.getByText('Своя категория', { exact: true })).toBeVisible()
    await block.getByRole('button', { name: 'Удалить', exact: true }).click()
    await expect(block.getByText('Своя категория', { exact: true })).toHaveCount(0)
  }
  await page.reload()
  await expect(page.getByText('Своя категория', { exact: true })).toHaveCount(0)
  const places = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Категории мест', exact: true }) })
  await places.getByLabel(/^Новая категория/).fill('Галерея')
  await places.getByRole('button', { name: 'Добавить', exact: true }).click()
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Галерея с историей')
  await dialog.getByLabel('Категория', { exact: true }).selectOption('Галерея')
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.goto('/settings')
  await places.getByRole('button', { name: 'Удалить', exact: true }).click()
  await page.reload()
  await expect(places.getByText('Галерея', { exact: true })).toHaveCount(0)
  await page.goto('/places')
  await page.getByRole('button', { name: 'Галерея с историей', exact: true }).last().click()
  await dialog.getByRole('button', { name: 'Редактировать', exact: true }).click()
  const edit = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Редактировать место', exact: true }) })
  await expect(edit.getByLabel('Категория', { exact: true })).toHaveValue('Галерея')
  await edit.getByRole('button', { name: 'Отмена', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  await expect(
    dialog.getByLabel('Категория', { exact: true }).locator('option', { hasText: 'Галерея' }),
  ).toHaveCount(0)
})

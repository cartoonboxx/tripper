import { expect, test } from '@playwright/test'

test('today only displays checklists attached in advance and keeps their progress', async ({
  page,
}) => {
  await page.goto('/checklists')
  await page.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Мой новый список')
  await dialog.getByRole('button', { name: 'Создать', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Мой новый список', exact: true })).toBeVisible()
  await expect(dialog).toHaveCount(0)
  await page.getByPlaceholder('Введите название пункта').fill('Забрать билеты')
  await page.getByPlaceholder('Введите название пункта').press('Enter')
  await page.goto('/trips/florence/today')
  await expect(page.getByRole('heading', { name: 'Чек-листы поездки', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Мой новый список/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Создать чек-лист', exact: true })).toHaveCount(0)
  await expect(page.getByPlaceholder('Введите название пункта')).toHaveCount(0)
  await page.goto('/checklists')
  await page.getByRole('button', { name: /^Мой новый список/ }).click()
  await page.getByRole('button', { name: 'Добавить в поездку', exact: true }).click()
  await dialog.getByLabel('Поездка', { exact: true }).selectOption('florence')
  await dialog.getByRole('button', { name: 'Добавить', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.goto('/trips/florence/today')
  await page.getByRole('button', { name: /^Мой новый список/ }).click()
  await page.getByRole('checkbox', { name: 'Забрать билеты', exact: true }).check()
  await page.reload()
  await page.getByRole('button', { name: /^Мой новый список/ }).click()
  await expect(page.getByRole('checkbox', { name: 'Забрать билеты', exact: true })).toBeChecked()
  await page.goto('/checklists')
  await page.getByRole('button', { name: /^Мой новый список/ }).click()
  await expect(
    page.getByRole('checkbox', { name: 'Забрать билеты', exact: true }),
  ).not.toBeChecked()
  await page.goto('/trips/altai/today')
  await expect(
    page.getByRole('heading', { name: 'Нет прикреплённых чек-листов', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /^Мой новый список/ })).toHaveCount(0)
})

test('trip-created checklists stay in their trip and general creation can target a trip', async ({
  page,
}) => {
  await page.goto('/trips/florence/checklists')
  await page.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Только Флоренция')
  await expect(dialog.getByLabel('Добавить в поездку')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Создать', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Только Флоренция', exact: true })).toBeVisible()
  await expect(dialog).toHaveCount(0)
  await page.getByPlaceholder('Введите название пункта').fill('Билеты в галерею')
  await page.getByPlaceholder('Введите название пункта').press('Enter')
  await expect(page.getByRole('checkbox', { name: 'Билеты в галерею', exact: true })).toBeVisible()
  await page.goto('/checklists')
  await expect(page.getByRole('button', { name: /^Только Флоренция/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
  await dialog.getByLabel(/^Название/).fill('Только Алтай')
  await dialog.getByLabel('Добавить в поездку').selectOption('altai')
  await dialog.getByRole('button', { name: 'Создать', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Только Алтай/ })).toHaveCount(0)
  await page.goto('/trips/altai/checklists')
  await expect(page.getByRole('heading', { name: 'Только Алтай', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Только Флоренция/ })).toHaveCount(0)
  await page.goto('/trips/florence/today')
  await page.getByRole('button', { name: /^Только Флоренция/ }).click()
  await page.getByRole('link', { name: 'Управлять чек-листами', exact: true }).click()
  await expect(page).toHaveURL(/\/trips\/florence\/checklists$/)
  await page.getByRole('button', { name: /^Только Флоренция/ }).click()
  await expect(page.getByRole('checkbox', { name: 'Билеты в галерею', exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /^Только Флоренция/ }).click()
  await expect(page.getByRole('checkbox', { name: 'Билеты в галерею', exact: true })).toBeVisible()
})

test('expenses and statistics use only the selected trip and have no budget analytics', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'tripper:expenses',
      JSON.stringify([
        {
          id: 'one',
          tripId: 'florence',
          title: 'Обед во Флоренции',
          category: 'Питание',
          amount: 300,
        },
        {
          id: 'two',
          tripId: 'florence',
          title: 'Такси во Флоренции',
          category: 'Транспорт',
          amount: 600,
        },
        {
          id: 'other',
          tripId: 'altai',
          title: 'Отель на Алтае',
          category: 'Проживание',
          amount: 5000,
        },
      ]),
    )
  })
  await page.goto('/expenses')
  await expect(page.getByLabel('Поездка', { exact: true })).toHaveValue('florence')
  await expect(page.getByText('900 ₽', { exact: true })).toBeVisible()
  await expect(page.getByText('Обед во Флоренции', { exact: true })).toBeVisible()
  await expect(page.getByText('Отель на Алтае', { exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'На что уходит бюджет', exact: true }),
  ).toHaveCount(0)
  await page.getByLabel('Категории', { exact: true }).selectOption('Питание')
  await expect(page.getByText('Такси во Флоренции', { exact: true })).toHaveCount(0)
  await expect(page.getByText('900 ₽', { exact: true })).toBeVisible()
  await page.getByLabel('Поездка', { exact: true }).selectOption('altai')
  await expect(page.getByText('5 000 ₽', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Отель на Алтае', { exact: true })).toBeVisible()
  await expect(page.getByText('Обед во Флоренции', { exact: true })).toHaveCount(0)
  await page.goto('/trips/florence/expenses')
  await expect(page.getByText('900 ₽', { exact: true })).toBeVisible()
  await expect(page.getByText('Отель на Алтае', { exact: true })).toHaveCount(0)
  await expect(page.getByLabel('Поездка', { exact: true })).toHaveCount(0)
})

test('textarea grows and shrinks for typing, external model changes and width changes', async ({
  page,
}) => {
  await page.goto('/ui-kit')
  const field = page.getByLabel('Многострочные заметки', { exact: true })
  await field.fill('Короткая заметка')
  const initial = (await field.boundingBox())!.height
  await field.fill(Array.from({ length: 14 }, (_, index) => `Строка ${index + 1}`).join('\n'))
  await expect.poll(async () => (await field.boundingBox())!.height).toBeGreaterThan(initial * 2)
  expect(await field.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(
    true,
  )
  await field.fill('Короткая заметка')
  await expect.poll(async () => (await field.boundingBox())!.height).toBe(initial)
  const text = 'Длинная заметка о путешествии и интересных местах. '.repeat(16)
  await page.getByLabel('Название поездки', { exact: true }).fill(text)
  await expect(field).toHaveValue(text)
  const wide = (await field.boundingBox())!.height
  await page.setViewportSize({ width: 375, height: 812 })
  await expect.poll(async () => (await field.boundingBox())!.height).toBeGreaterThan(wide)
  expect(await field.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(
    true,
  )
  await page.getByLabel('Название поездки', { exact: true }).fill('Снова короткая')
  await expect.poll(async () => (await field.boundingBox())!.height).toBe(initial)
})

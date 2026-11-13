import { expect, test } from '@playwright/test'

for (const width of [1440, 375, 320]) {
  test(`trip checklists attach a personal list and create a new one at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/checklists')
    await page.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('combobox')).toHaveCount(0)
    await dialog.getByLabel(/^Название/).fill('Мои документы')
    await dialog.getByRole('button', { name: 'Создать', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByPlaceholder('Введите название пункта').fill('Паспорт')
    await page.getByPlaceholder('Введите название пункта').press('Enter')
    await page.getByRole('checkbox', { name: 'Паспорт', exact: true }).check()
    await page.goto('/trips/altai/checklists')
    await page.getByRole('button', { name: 'Прикрепить чек-лист', exact: true }).click()
    await expect(dialog.getByLabel('Личный чек-лист')).toHaveValue(/.+/)
    await expect(dialog.getByLabel('Личный чек-лист').locator('option')).toHaveText([
      'Мои документы',
    ])
    await dialog.getByRole('button', { name: 'Прикрепить', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Мои документы', exact: true })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).not.toBeChecked()
    await page.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
    await dialog.getByLabel(/^Название/).fill('Перед выездом')
    await dialog.getByRole('button', { name: 'Создать', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByPlaceholder('Введите название пункта').fill('Вызвать такси')
    await page.getByPlaceholder('Введите название пункта').press('Enter')
    await page.reload()
    await page.getByRole('button', { name: /^Перед выездом/ }).click()
    await expect(page.getByRole('checkbox', { name: 'Вызвать такси', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.goto('/checklists')
    await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).toBeChecked()
    await expect(page.getByRole('button', { name: /^Перед выездом/ })).toHaveCount(0)
    await page.goto('/trips/altai/today')
    await expect(page.getByRole('button', { name: /^Мои документы/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Перед выездом/ })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Прикрепить чек-лист', exact: true }),
    ).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Создать чек-лист', exact: true })).toHaveCount(0)
  })
}

test('an empty personal library offers creation, while a viewer cannot attach or create', async ({
  page,
}) => {
  await page.goto('/trips/altai/checklists')
  await page.getByRole('button', { name: 'Прикрепить чек-лист', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('heading', { name: 'Нет личных чек-листов', exact: true }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Создать чек-лист', exact: true }).click()
  await expect(dialog).toHaveCount(1)
  await expect(dialog.getByLabel(/^Название/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.evaluate(() => {
    const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
    trips.find((trip: { id: string }) => trip.id === 'altai').role = 'viewer'
    localStorage.setItem('tripper:trips', JSON.stringify(trips))
  })
  await page.reload()
  await expect(page.getByRole('button', { name: 'Прикрепить чек-лист', exact: true })).toHaveCount(
    0,
  )
  await expect(page.getByRole('button', { name: 'Создать чек-лист', exact: true })).toHaveCount(0)
})

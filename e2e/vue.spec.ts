import { test, expect } from '@playwright/test'

test('all main routes render without runtime errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const routes = [
    '/',
    '/trips',
    '/trips/florence/overview',
    '/trips/florence/today',
    '/trips/florence/plan',
    '/trips/florence/places',
    '/trips/florence/checklists',
    '/trips/florence/expenses',
    '/trips/florence/participants',
    '/trips/florence/information',
    '/trips/florence/events/e1',
    '/places',
    '/checklists',
    '/expenses',
    '/archive',
    '/settings',
    '/ui-kit',
    '/login',
    '/register',
    '/join/florence',
    '/missing',
  ]
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('h1,h2,h3').first()).toBeVisible()
    await expect(page.locator('body')).not.toContainText('You did it!')
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll('*')].some((el) =>
          [...el.attributes].some(
            (attr) =>
              attr.name.startsWith('aria-') ||
              attr.name.startsWith('data-') ||
              attr.name === 'tabindex',
          ),
        ),
      ),
    ).toBe(false)
  }
  expect(errors).toEqual([])
})

test('create a trip and retain it after reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Создать поездку', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Название поездки').fill('Осень в Лиссабоне')
  await dialog.getByLabel('Страна или регион').fill('Португалия')
  await dialog.getByLabel('Начало поездки').fill('2026-11-20')
  await dialog.getByLabel('Конец поездки').fill('2026-11-25')
  await dialog.getByRole('button', { name: 'Создать поездку', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Осень в Лиссабоне', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Осень в Лиссабоне', exact: true })).toBeVisible()
})

test('add, edit and delete an event', async ({ page }) => {
  await page.goto('/trips/florence/plan')
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByLabel('Название', { exact: false }).fill('Прогулка по набережной')
  await dialog.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Прогулка по набережной' })).toBeVisible()
  await page
    .getByRole('button', { name: 'Редактировать Прогулка по набережной', exact: true })
    .click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel('Название', { exact: false }).fill('Вечер у реки')
  await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await page.getByRole('button', { name: 'Удалить Вечер у реки', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Вечер у реки' })).toHaveCount(0)
})

test('checklists persist and viewer cannot edit the shared plan', async ({ page }) => {
  await page.goto('/trips/florence/checklists')
  await page.getByRole('checkbox', { name: 'Аптечка', exact: true }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Аптечка', exact: true })).toBeChecked()
  await page.goto('/join/florence')
  await page.getByRole('button', { name: 'Открыть поездку' }).click()
  await page.getByRole('link', { name: 'План поездки', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Добавить событие', exact: true })).toHaveCount(0)
  await expect(page.getByText('Только просмотр', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Места', exact: true }).last().click()
  await expect(page.getByRole('button', { name: 'Добавить место', exact: true })).toHaveCount(0)
})

test('invitation generates QR and modal closes with Escape', async ({ page }) => {
  await page.goto('/trips/florence/participants')
  await page.getByRole('button', { name: 'Пригласить участников' }).click()
  await page.getByRole('button', { name: 'QR-код', exact: true }).click()
  await expect(page.getByRole('img', { name: 'QR-код приглашения в поездку' })).toHaveAttribute(
    'src',
    /^data:image\/png/,
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

for (const device of [
  { name: 'Samsung S24', width: 360, height: 780 },
  { name: 'iPhone 16 Pro Max', width: 440, height: 956 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone SE small', width: 320, height: 568 },
]) {
  test(`${device.name}: readable pages and bottom navigation`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height })
    for (const route of [
      '/',
      '/trips/florence/plan',
      '/trips/florence/places',
      '/trips/florence/checklists',
      '/trips/florence/expenses',
      '/trips/florence/participants',
      '/trips/florence/information',
      '/settings',
      '/login',
    ]) {
      await page.goto(route)
      await expect(page.locator('h1,h2,h3').first()).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      expect(
        await page.locator('body').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16)
    }
    await page.goto('/')
    await page.getByRole('button', { name: 'Создать поездку', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    expect(
      await dialog
        .getByLabel('Название поездки')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16)
    const dialogBounds = await dialog.boundingBox()
    expect(dialogBounds?.x).toBeGreaterThanOrEqual(0)
    expect((dialogBounds?.x || 0) + (dialogBounds?.width || 0)).toBeLessThanOrEqual(device.width)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    const navigation = page.getByRole('navigation', { name: 'Мобильная навигация' })
    await expect(navigation).toBeVisible()
    const bounds = await navigation.boundingBox()
    expect(bounds?.y).toBeGreaterThan(0)
    expect(Math.round((bounds?.y || 0) + (bounds?.height || 0))).toBe(device.height)
    await navigation.getByRole('link', { name: 'Места', exact: true }).click()
    await expect(navigation.getByRole('link', { name: 'Места', exact: true })).toHaveCSS(
      'color',
      'rgb(55, 107, 89)',
    )
    await navigation.getByRole('button', { name: 'Ещё' }).click()
    await page
      .getByRole('navigation', { name: 'Дополнительные разделы' })
      .getByRole('link', { name: 'Архив', exact: true })
      .click()
    await expect(page.getByRole('heading', { name: 'Архив путешествий' })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
}

test('returning from Today selects a valid trip day', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2027-01-01T12:00:00'))
  await page.goto('/trips/florence/plan')
  await page
    .getByRole('navigation', { name: 'Разделы поездки' })
    .getByRole('link', { name: 'Сегодня', exact: true })
    .click()
  await page
    .getByRole('navigation', { name: 'Разделы поездки' })
    .getByRole('link', { name: 'План поездки', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: /День 2/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Добавить событие', exact: true })).toBeVisible()
})

test('UI-kit shows every control and its interactive states without aria attributes', async ({
  page,
}) => {
  await page.goto('/ui-kit')
  for (const name of [
    'Button',
    'Input',
    'Select',
    'Tab',
    'Badge',
    'Avatar',
    'Card',
    'Checkbox',
    'Switch',
    'EmptyState',
    'Modal',
    'Drawer',
    'Готовые блоки системы',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Primary', exact: true })).toHaveCSS(
    'background-color',
    'rgb(55, 107, 89)',
  )
  await expect(page.getByRole('button', { name: 'Secondary', exact: true })).toHaveCSS(
    'border-top-color',
    'rgb(229, 232, 225)',
  )
  await expect(page.locator('#avatars > div > span').first()).toHaveCSS('width', '28px')
  await page.getByLabel('Название поездки', { exact: true }).fill('Тест UI-kit')
  await expect(page.getByText('Текущее значение: Тест UI-kit', { exact: true })).toBeVisible()
  const checkbox = page.getByRole('checkbox', { name: 'Паспорт в чемодане', exact: true })
  await checkbox.uncheck()
  await expect(page.getByText('Пункт ещё не выполнен', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Открыть Modal', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Готово', exact: true }).click()
  await page.getByRole('button', { name: 'Открыть Drawer', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll('*')].flatMap((el) =>
        [...el.attributes].filter(
          (attr) =>
            attr.name.startsWith('aria-') ||
            attr.name.startsWith('data-') ||
            attr.name === 'tabindex',
        ),
      ),
    ),
  ).toEqual([])
})

test('mobile input focus, soft presses and sheet gestures', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/ui-kit')
  const input = page.getByLabel('Название поездки', { exact: true })
  await input.focus()
  await expect(input).toHaveCSS('outline-style', 'none')
  await expect(input.locator('..')).toHaveCSS('border-top-color', 'rgb(55, 107, 89)')
  const opener = page.getByRole('button', { name: 'Открыть Modal', exact: true })
  await opener.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 20, clientY: 20 })
  await expect(opener).toHaveCSS('scale', '0.975')
  await opener.dispatchEvent('pointercancel', { pointerType: 'touch' })
  await expect(opener).not.toHaveClass(/isPressed/)
  await opener.focus()
  await opener.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  const panel = dialog.locator('section')
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  const handle = panel.locator(':scope > div').first()
  const bounds = await handle.boundingBox()
  expect(bounds).not.toBeNull()
  const x = bounds!.x + bounds!.width / 2
  const y = bounds!.y + bounds!.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + 25, { steps: 5 })
  await page.mouse.up()
  await expect(dialog).toBeVisible()
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + 150, { steps: 5 })
  await page.mouse.up()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(opener).toBeFocused()
})

import { expect, test } from '@playwright/test'

const forecast = {
  current: { temperature_2m: 12.4, weather_code: 3 },
  daily: {
    temperature_2m_min: [7.2],
    temperature_2m_max: [14.7],
    precipitation_probability_max: [20],
  },
}

test('standalone places have category filters, a matching textarea and a right drawer', async ({
  page,
}) => {
  await page.goto('/places')
  const search = page.getByPlaceholder('Найти место…')
  const content = page.locator('main')
  const searchWidth = (await search.locator('..').locator('..').boundingBox())!.width
  expect(searchWidth).toBeGreaterThan((await content.boundingBox())!.width * 0.5)
  await expect(page.getByRole('combobox', { name: 'Категория места', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Поездка', { exact: true })).toHaveCount(0)
  await dialog.getByLabel(/^Название/).fill('Новая находка')
  const notes = dialog.getByLabel('Заметки', { exact: true })
  await expect(notes).toHaveJSProperty('tagName', 'TEXTAREA')
  await notes.fill('Две строки\nи заметки')
  const fieldStyles = await dialog
    .locator('input:not([type=file]), textarea')
    .evaluateAll((fields) =>
      fields.map((field) => ({
        font: getComputedStyle(field).fontFamily,
        size: getComputedStyle(field).fontSize,
        color: getComputedStyle(field).color,
      })),
    )
  expect(
    fieldStyles.every((field) => JSON.stringify(field) === JSON.stringify(fieldStyles[0])),
  ).toBe(true)
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Новая находка', exact: true }).last().click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'В поездках', exact: true })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Убрать из поездки', exact: true })).toHaveCount(
    0,
  )
  await expect(page.getByText(/^В поездках:/)).toHaveCount(0)
  await expect(dialog).toHaveCSS('transform', 'none')
  const bounds = (await dialog.boundingBox())!
  expect(bounds.x).toBeGreaterThan(0)
  expect(Math.round(bounds.x + bounds.width)).toBe(page.viewportSize()!.width)
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(dialog).toHaveCSS('width', '375px')
  expect((await dialog.boundingBox())!.x).toBe(0)
  await expect(dialog.getByRole('button', { name: 'Добавить в поездку', exact: true })).toHaveCount(
    0,
  )
  await expect(dialog.getByRole('combobox')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Новая находка', exact: true }).last(),
  ).toBeVisible()
  await page.goto('/trips/altai/places')
  await expect(page).toHaveURL(/\/places$/)
  await page.getByRole('button', { name: 'Новая находка', exact: true }).last().click()
  await expect(dialog.getByRole('button', { name: 'Добавить в поездку', exact: true })).toHaveCount(
    0,
  )
})

test('today shows weather and checklists without the expenses block', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 55.75, longitude: 37.61 } } as GeolocationPosition),
      },
    })
  })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    const url = new URL(route.request().url())
    expect(url.searchParams.get('latitude')).toBe('55.75')
    expect(url.searchParams.get('longitude')).toBe('37.61')
    expect(url.searchParams.get('timezone')).toBe('auto')
    await route.fulfill({ json: forecast })
  })
  await page.goto('/trips/florence/today')
  await expect(page.getByText('12°C', { exact: true })).toBeVisible()
  await expect(page.getByText('Сегодня от 7° до 15° · Осадки 20%')).toBeVisible()
  const checklists = page.getByRole('heading', { name: 'Чек-листы поездки', exact: true })
  const expenses = page.getByRole('heading', { name: 'Расходы поездки', exact: true })
  await expect(checklists).toBeVisible()
  await expect(expenses).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Обзор', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Информация', exact: true })).toHaveCount(0)
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole('button', { name: /^Документы/ }).click()
  await expect(page.getByRole('checkbox', { name: 'Страховка', exact: true })).toBeVisible()
  await page.goto('/trips/florence/information')
  await expect(page).toHaveURL(/\/plan$/)
  await page.goto('/trips/florence/overview')
  await expect(page).toHaveURL(/\/plan$/)
})

test('denied geolocation provides a useful fallback without a fake forecast', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) =>
          failure({ code: 1 } as GeolocationPositionError),
      },
    })
  })
  await page.goto('/trips/florence/today')
  await expect(
    page.getByText(
      'Разрешите доступ к геолокации в настройках браузера, чтобы увидеть погоду рядом с вами.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Обновить погоду', exact: true })).toBeEnabled()
})

test('holding the card moves it with the pointer and saves its position', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto('/trips/florence/plan')
  const cards = page.getByRole('article')
  const first = cards.filter({
    has: page.getByRole('heading', { name: 'Галерея Уффици', exact: true }),
  })
  const second = cards.filter({
    has: page.getByRole('heading', { name: 'Обед в Trattoria Za Za', exact: true }),
  })
  const heading = first.getByRole('heading', { level: 3 })
  await heading.scrollIntoViewIfNeeded()
  const source = (await heading.boundingBox())!
  const target = (await second.boundingBox())!
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await expect(first).toHaveCSS('position', 'fixed')
  await page.mouse.move(target.x + target.width / 2, target.y + target.height * 0.8)
  await expect.poll(async () => (await first.boundingBox())!.y).toBeGreaterThan(source.y)
  await expect(cards.nth(1)).toContainText('Галерея Уффици')
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(first).toHaveCSS('position', 'relative')
  await expect(cards.first().getByRole('heading', { level: 3 })).toHaveText(
    'Обед в Trattoria Za Za',
  )
  await expect(second).toContainText('10:00')
  await expect(second).toContainText('12:00')
  await expect(first).toContainText('13:00')
  await expect(first).toContainText('14:00')
  await page.reload()
  await expect(cards.first().getByRole('heading', { level: 3 })).toHaveText(
    'Обед в Trattoria Za Za',
  )
  await expect(page.getByRole('button', { name: 'Переместить', exact: true })).toHaveCount(0)
})

test('vertical tabs have navigation hover feedback', async ({ page }) => {
  await page.goto('/trips/florence/plan')
  const day = page.getByRole('button', { name: /^День 3/ })
  await day.hover()
  const background = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
  )
  await expect(day).toHaveCSS(
    'background-color',
    background.startsWith('#')
      ? await day.evaluate((element, value) => {
          const probe = document.createElement('div')
          probe.style.color = value
          element.append(probe)
          const color = getComputedStyle(probe).color
          probe.remove()
          return color
        }, background)
      : background,
  )
})

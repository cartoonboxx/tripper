import { expect, test } from '@playwright/test'
import {
  mockMapbox,
  openPicker,
  picker,
  geocodingEndpoint,
  geocodingResult,
  addressMapButton,
} from './fixtures/mapbox'

test.beforeEach(async ({ page }) => {
  await mockMapbox(page)
})

test('expands the map dialog and restores its size without losing the selected address', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openPicker(page)
  const map = picker(page)
  const canvas = map.locator('.mapboxgl-canvas')
  await canvas.click({ position: { x: 100, y: 100 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  const original = (await map.boundingBox())!
  const originalCanvas = (await canvas.boundingBox())!
  const point = await map.getByText(/Выбранная точка:/).innerText()

  await map.getByRole('button', { name: 'На весь экран', exact: true }).click()
  await expect.poll(() => map.boundingBox()).toEqual({ x: 0, y: 0, width: 1440, height: 1000 })
  await expect
    .poll(async () => (await canvas.boundingBox())!.height)
    .toBeGreaterThan(originalCanvas.height)
  await expect(map.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeInViewport()
  await expect(map.getByText(point, { exact: true })).toBeVisible()

  await map.getByRole('button', { name: 'Свернуть', exact: true }).click()
  await expect.poll(() => map.boundingBox()).toEqual(original)
  await expect.poll(() => canvas.boundingBox()).toEqual(originalCanvas)
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')

  await page.setViewportSize({ width: 390, height: 844 })
  await map.getByRole('button', { name: 'На весь экран', exact: true }).click()
  await expect.poll(() => map.boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 })
  await expect(map.getByRole('button', { name: 'Свернуть', exact: true })).toBeInViewport()
  await expect(map.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeInViewport()
})

test('opening the picker does not request a random address or geolocation', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/search/geocode/')) requests.push(request.url())
  })
  await openPicker(page)
  await expect(
    picker(page).getByRole('button', { name: 'Сохранить адрес', exact: true }),
  ).toBeDisabled()
  expect(requests).toHaveLength(0)
})

test('searches, saves street and house, persists the selection, and cancels changes', async ({
  page,
}) => {
  await openPicker(page)
  const map = picker(page)
  await map.getByLabel('Поиск адреса').fill('Москва Тверская 7')
  await map.getByRole('button', { name: 'Найти', exact: true }).click()
  await map.getByRole('button', { name: 'Тверская улица, 7 Москва, Россия' }).click()
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 7')
  await page.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Место на карте', exact: true }).last().click()
  await page.getByRole('button', { name: 'Редактировать', exact: true }).click()
  await addressMapButton(page).click()
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await map.getByLabel('Улица и дом').fill('Другой адрес')
  await map.getByRole('button', { name: 'Отмена', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 7')
})

test('clicking a house resolves the address and allows correction before saving', async ({
  page,
}) => {
  await openPicker(page)
  const map = picker(page)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 100, y: 100 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await map.getByLabel('Улица и дом').fill('Тверская улица, 7, корпус 1')
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 7, корпус 1')
})

test('zooms smoothly in half steps and keeps the chosen address', async ({ page }) => {
  let requests = 0
  page.on('request', (request) => {
    if (request.url().includes('/search/geocode/')) requests++
  })
  await openPicker(page)
  const map = picker(page)
  const canvas = map.locator('.mapboxgl-canvas')
  const bounds = (await canvas.boundingBox())!
  await canvas.click({ position: { x: bounds.width * 0.65, y: bounds.height * 0.55 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  const point = await map.getByText(/Выбранная точка:/).innerText()
  const marker = map.locator('.mapboxgl-marker')
  const before = (await marker.boundingBox())!
  const center = bounds.x + bounds.width / 2
  const distance = before.x + before.width / 2 - center
  await map.getByRole('button', { name: 'Приблизить', exact: true }).click()
  await expect
    .poll(async () => {
      const current = (await marker.boundingBox())!
      return (current.x + current.width / 2 - center) / distance
    })
    .toBeCloseTo(Math.SQRT2, 1)
  await expect(map.getByText(point, { exact: true })).toBeVisible()
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  expect(requests).toBe(1)
})

test('keeps map gestures from dismissing the dialog and the point from following the map', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPicker(page)
  const map = picker(page)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 100, y: 100 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  const bounds = (await map.locator('.mapboxgl-canvas').boundingBox())!
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width / 2 - 60, bounds.y + bounds.height / 2 + 40, {
    steps: 8,
  })
  await page.mouse.up()
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await expect(map.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeInViewport()
})

test('allows a manual address when the geocoder is unavailable', async ({ page }) => {
  await page.route(geocodingEndpoint, (route) => route.fulfill({ status: 503 }))
  await openPicker(page)
  const map = picker(page)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 100, y: 100 } })
  await expect(
    map.getByText('Сервис адресов Mapbox временно недоступен. Попробуйте позже.'),
  ).toBeVisible()
  await map.getByLabel('Улица и дом').fill('Тверская улица, 9')
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 9')
})

test('a late lookup cannot overwrite the newer point address', async ({ page }) => {
  let release!: () => void
  const delayed = new Promise<void>((resolve) => {
    release = resolve
  })
  let count = 0
  await page.route(geocodingEndpoint, async (route) => {
    const first = ++count === 1
    if (first) await delayed
    await route.fulfill({ json: geocodingResult(first ? 'Старый адрес' : 'Новый адрес', '5') })
  })
  await openPicker(page)
  const map = picker(page)
  const request = page.waitForRequest(geocodingEndpoint)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 100, y: 100 } })
  await request
  await map.locator('.mapboxgl-canvas').click({ position: { x: 160, y: 160 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Новый адрес, 5')
  release()
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Новый адрес, 5')
})

test('dragging the marker selects a new point and looks up its address', async ({ page }) => {
  await openPicker(page)
  const map = picker(page)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 180, y: 180 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  const before = await map.getByText(/Выбранная точка:/).innerText()
  const bounds = (await map.locator('.mapboxgl-marker').boundingBox())!
  const request = page.waitForRequest((request) => request.url().includes('/geocode/v6/reverse'))
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width / 2 + 70, bounds.y + bounds.height / 2 + 30, {
    steps: 10,
  })
  await page.mouse.up()
  await request
  await expect(map.getByText(/Выбранная точка:/)).not.toHaveText(before)
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
})

test('shows style loading errors and retries with a fresh map', async ({ page }) => {
  await page.route('https://api.mapbox.com/styles/v1/**', (route) =>
    route.fulfill({ status: 401, json: { message: 'Not Authorized' } }),
  )
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  await addressMapButton(page).click()
  const map = picker(page)
  await expect(map.getByText(/Не удалось загрузить карту/)).toBeVisible()
  await expect(map.getByRole('button', { name: 'Приблизить', exact: true })).toBeDisabled()
  await page.unroute('https://api.mapbox.com/styles/v1/**')
  await map.getByRole('button', { name: 'Попробовать ещё раз', exact: true }).click()
  await expect(map.getByRole('button', { name: 'Приблизить', exact: true })).toBeEnabled({
    timeout: 15000,
  })
})

test('saves the selected address without making another geocoding request', async ({ page }) => {
  const parameters: URLSearchParams[] = []
  await page.route(geocodingEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams
    parameters.push(params)
    return params.get('permanent') === 'true'
      ? route.fulfill({
          status: 429,
          json: {
            message: 'Too Many Requests',
            softRateLimit: true,
            error_code: 'RATE_LIMIT_EXCEEDED',
          },
        })
      : route.fulfill({ json: geocodingResult() })
  })
  await openPicker(page)
  const map = picker(page)
  await map.getByLabel('Поиск адреса').fill('Тверская улица 7')
  await map.getByRole('button', { name: 'Найти', exact: true }).click()
  await map.getByRole('button', { name: 'Тверская улица, 7 Москва, Россия' }).click()
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  expect(parameters[0]!.get('permanent')).toBe('false')
  expect(parameters[0]!.get('proximity')).toBe('37.6173,55.7558')
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 7')
  expect(parameters).toHaveLength(1)
  await page.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Место на карте', exact: true }).last().click()
  await expect(
    page.getByRole('dialog').getByText('Тверская улица, 7', { exact: true }),
  ).toBeVisible()
})

test('copies the clicked address and manual corrections without another lookup', async ({
  page,
}) => {
  await page.route(geocodingEndpoint, (route) => {
    const params = new URL(route.request().url()).searchParams
    return params.get('permanent') === 'true'
      ? route.fulfill({ status: 429, json: { softRateLimit: true } })
      : route.fulfill({ json: geocodingResult('Большая Никитская улица', '22') })
  })
  await openPicker(page)
  const map = picker(page)
  await map.locator('.mapboxgl-canvas').click({ position: { x: 180, y: 180 } })
  await expect(map.getByLabel('Улица и дом')).toHaveValue('Большая Никитская улица, 22')
  let extraRequests = 0
  await page.route(geocodingEndpoint, (route) => {
    extraRequests++
    return route.abort()
  })
  await map.getByLabel('Улица и дом').fill('Большая Никитская улица, 22, корпус 1')
  await map.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue(
    'Большая Никитская улица, 22, корпус 1',
  )
  expect(extraRequests).toBe(0)
})

import { expect, test } from '@playwright/test'
import { mockMapbox, openPicker, picker, addressMapButton } from './fixtures/mapbox'

test.beforeEach(async ({ page }) => {
  await mockMapbox(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('opens a new place near the current city without selecting an address', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 59.9386, longitude: 30.3141 })
  const geocoding: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/search/geocode/')) geocoding.push(request.url())
  })
  await openPicker(page)
  const dialog = picker(page)
  await expect(dialog.getByText('Определяем местоположение…', { exact: true })).toHaveCount(0)
  await expect(dialog.locator('.mapboxgl-marker')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeDisabled()
  expect(geocoding).toHaveLength(0)
  await dialog.getByLabel('Поиск адреса').fill('Невский проспект')
  const request = page.waitForRequest((request) =>
    request.url().includes('/search/geocode/v6/forward'),
  )
  await dialog.getByLabel('Поиск адреса').press('Enter')
  const proximity = new URL((await request).url()).searchParams
    .get('proximity')!
    .split(',')
    .map(Number)
  expect(proximity[0]).toBeCloseTo(30.3141, 3)
  expect(proximity[1]).toBeCloseTo(59.9386, 3)
})

test('keeps saved coordinates when reopening the place map', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 59.9386, longitude: 30.3141 })
  let requests = 0
  await page.exposeFunction('recordLocationRequest', () => {
    requests++
  })
  await page.addInitScript(() => {
    const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation)
    navigator.geolocation.getCurrentPosition = (...args) => {
      void (
        window as Window & { recordLocationRequest: () => Promise<void> }
      ).recordLocationRequest()
      original(...args)
    }
  })
  await openPicker(page)
  await expect.poll(() => requests).toBe(1)
  const dialog = picker(page)
  await dialog.locator('.mapboxgl-canvas').click({ position: { x: 180, y: 180 } })
  await expect(dialog.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await dialog.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
  await addressMapButton(page).click()
  await expect(dialog.locator('.mapboxgl-marker')).toHaveCount(1)
  await expect(dialog.getByText('Загружаем карту…', { exact: true })).toHaveCount(0)
  expect(requests).toBe(1)
})

test('allows choosing a point when geolocation is denied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({ code: 1 } as GeolocationPositionError),
      },
    })
  })
  await openPicker(page)
  const dialog = picker(page)
  await expect(
    dialog.getByText(
      'Не удалось определить местоположение. Найдите адрес или выберите дом на карте.',
    ),
  ).toBeVisible()
  await dialog.locator('.mapboxgl-canvas').click({ position: { x: 180, y: 180 } })
  await expect(dialog.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  await expect(dialog.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeEnabled()
})

test('ignores late geolocation after the user chooses a point', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          Object.assign(window, {
            releaseLocation: () =>
              success({ coords: { latitude: 35.68, longitude: 139.69 } } as GeolocationPosition),
          })
        },
      },
    })
  })
  await openPicker(page)
  const dialog = picker(page)
  await expect(dialog.getByText('Определяем местоположение…', { exact: true })).toBeVisible()
  await dialog.locator('.mapboxgl-canvas').click({ position: { x: 180, y: 180 } })
  await expect(dialog.getByLabel('Улица и дом')).toHaveValue('Тверская улица, 7')
  const point = await dialog.getByText(/Выбранная точка:/).innerText()
  await page.evaluate(() => (window as Window & { releaseLocation: () => void }).releaseLocation())
  await expect(dialog.getByText(point, { exact: true })).toBeVisible()
  await expect(dialog.getByText('Определяем местоположение…', { exact: true })).toHaveCount(0)
})

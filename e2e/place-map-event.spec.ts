import { expect, test, type Page } from '@playwright/test'
import { mockMapbox, geocodingEndpoint } from './fixtures/mapbox'

test.beforeEach(async ({ page }) => {
  await mockMapbox(page)
})

async function seedEvent(page: Page, options = { coordinates: true, attached: true }) {
  await page.addInitScript(({ coordinates, attached }) => {
    localStorage.setItem(
      'tripper:places',
      JSON.stringify(
        attached
          ? [
              {
                id: 'event-place',
                name: 'Место события',
                address: 'Тверская улица, 7',
                category: 'Достопримечательность',
                coordinates: coordinates ? { latitude: 55.757, longitude: 37.615 } : undefined,
                image: '',
                description: '',
              },
            ]
          : [],
      ),
    )
    localStorage.setItem(
      'tripper:events',
      JSON.stringify([
        {
          id: 'map-event',
          tripId: 'florence',
          day: '2026-11-11',
          title: 'Прогулка с картой',
          start: '10:00',
          end: '11:00',
          place: 'Место события',
          placeId: 'event-place',
          description: '',
          image: '',
        },
      ]),
    )
  }, options)
}

for (const width of [1440, 375]) {
  test(`shows the attached place in event drawer and page at ${width}px`, async ({ page }) => {
    await seedEvent(page)
    await page.setViewportSize({ width, height: 900 })
    const geocoding: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/search/geocode/')) geocoding.push(request.url())
    })
    await page.goto('/trips/florence/plan')
    await page.getByRole('button', { name: /Прогулка с картой/ }).click()
    const drawer = page.getByRole('dialog')
    await expect(drawer.getByRole('heading', { name: 'Место на карте' })).toBeVisible()
    await expect(drawer.getByText('Тверская улица, 7', { exact: true })).toBeVisible()
    await expect(drawer.getByRole('button', { name: '+', exact: true })).toBeVisible()
    const canvasBounds = (await drawer.locator('.mapboxgl-canvas').boundingBox())!
    for (const name of ['+', '−']) {
      const button = drawer.getByRole('button', { name, exact: true })
      const bounds = (await button.boundingBox())!
      expect(bounds.x).toBeGreaterThan(canvasBounds.x)
      expect(bounds.y).toBeGreaterThan(canvasBounds.y)
      expect(bounds.x + bounds.width).toBeLessThan(canvasBounds.x + canvasBounds.width)
      expect(bounds.y + bounds.height).toBeLessThan(canvasBounds.y + canvasBounds.height)
    }
    await expect(drawer.locator('.mapboxgl-marker')).toHaveCount(1)
    const marker = drawer.locator('.mapboxgl-marker')
    const position = (await marker.getAttribute('style'))!
    await drawer.locator('.mapboxgl-canvas').click({ position: { x: 40, y: 40 } })
    await expect(marker).toHaveAttribute('style', position)
    await drawer.getByRole('button', { name: '+', exact: true }).click()
    await expect(marker).toBeVisible()
    await expect(
      drawer.getByRole('button', { name: 'Редактировать', exact: true }),
    ).toBeInViewport()
    expect(geocoding).toHaveLength(0)
    await drawer.screenshot({ path: test.info().outputPath('event-map.png') })

    await page.goto('/trips/florence/events/map-event')
    await expect(page.getByRole('button', { name: '+', exact: true })).toBeVisible()
    await expect(page.locator('.mapboxgl-marker')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('finds an address when saved coordinates are absent', async ({ page }) => {
  await seedEvent(page, { coordinates: false, attached: true })
  await page.goto('/trips/florence/events/map-event')
  await expect(page.getByRole('button', { name: '+', exact: true })).toBeVisible()
  await expect(page.locator('.mapboxgl-marker')).toHaveCount(1)
})

test('shows a retry action when map loading fails', async ({ page }) => {
  await seedEvent(page)
  await page.route('https://api.mapbox.com/styles/v1/**', (route) => route.abort())
  await page.goto('/trips/florence/events/map-event')
  await expect(page.getByText('Не удалось загрузить карту. Попробуйте ещё раз.')).toBeVisible()
  await mockMapbox(page)
  await page.getByRole('button', { name: 'Попробовать ещё раз', exact: true }).click()
  await expect(page.getByRole('button', { name: '+', exact: true })).toBeVisible()
})

test('does not show a map for an event without an attached place', async ({ page }) => {
  await seedEvent(page, { coordinates: false, attached: false })
  await page.goto('/trips/florence/events/map-event')
  await expect(page.getByRole('heading', { name: 'Прогулка с картой', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Место на карте' })).toHaveCount(0)
})

test('shows an explanation if the address cannot be found', async ({ page }) => {
  await seedEvent(page, { coordinates: false, attached: true })
  await page.route(geocodingEndpoint, (route) => route.fulfill({ json: { features: [] } }))
  await page.goto('/trips/florence/events/map-event')
  await expect(
    page.getByText('Не удалось найти место на карте. Уточните адрес в карточке места.'),
  ).toBeVisible()
  await expect(page.locator('.mapboxgl-marker')).toHaveCount(0)
})

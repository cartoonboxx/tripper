import { expect, type Page } from '@playwright/test'

export const geocodingEndpoint = 'https://api.mapbox.com/search/geocode/v6/**'

export function geocodingResult(street = 'Тверская улица', house = '7') {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'selected-mapbox-id',
        geometry: { type: 'Point', coordinates: [37.615, 55.757] },
        properties: {
          feature_type: 'address',
          name: `${street}, ${house}`,
          context: {
            address: { street_name: street, address_number: house },
            place: { name: 'Москва' },
            country: { name: 'Россия' },
          },
        },
      },
    ],
  }
}

// Keep the actual Mapbox GL renderer, animation, markers and native gestures.
// Only remote map data and geocoder responses are replaced.
const mapStyle = {
  version: 8,
  sources: {
    neighborhood: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [37.58, 55.73],
                [37.615, 55.757],
                [37.65, 55.78],
              ],
            },
          },
        ],
      },
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#edf0e9' } },
    {
      id: 'street',
      type: 'line',
      source: 'neighborhood',
      paint: { 'line-color': '#ffffff', 'line-width': 8 },
    },
  ],
}

export async function mockMapbox(page: Page) {
  await page.route('https://api.mapbox.com/**', (route) => {
    if (new URL(route.request().url()).pathname.startsWith('/styles/v1/'))
      return route.fulfill({ json: mapStyle })
    return route.fulfill({ json: {} })
  })
  await page.route('https://events.mapbox.com/**', (route) => route.fulfill({ status: 204 }))
  await page.route(geocodingEndpoint, (route) => route.fulfill({ json: geocodingResult() }))
}

export function picker(page: Page) {
  return page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Место на карте', exact: true }) })
}

export function addressMapButton(page: Page) {
  return page.getByLabel('Адрес', { exact: true }).locator('..').getByRole('button')
}

export async function openPicker(page: Page) {
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  await page.getByLabel(/^Название/).fill('Место на карте')
  await addressMapButton(page).click()
  await expect(picker(page).getByRole('button', { name: 'Приблизить', exact: true })).toBeEnabled({
    timeout: 15000,
  })
}

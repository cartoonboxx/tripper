import { expect, test } from '@playwright/test'
import { mockMapbox, openPicker, picker, addressMapButton } from './fixtures/mapbox'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test('touch gestures keep the map dialog open and its footer visible', async ({ page }) => {
  await mockMapbox(page)
  await openPicker(page)
  const dialog = picker(page)
  const bounds = (await dialog.locator('.mapboxgl-canvas').boundingBox())!
  const client = await page.context().newCDPSession(page)
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let step = 1; step <= 8; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x - step * 5, y: y + step * 12 }],
    })
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Сохранить адрес', exact: true }),
  ).toBeInViewport()
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).tap()
  await expect(addressMapButton(page)).toBeVisible()
})

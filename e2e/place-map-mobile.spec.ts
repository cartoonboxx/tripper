import { expect, test } from '@playwright/test'
import { mockMapbox, openPicker, picker } from './fixtures/mapbox'

for (const viewport of [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
]) {
  test(`searches from a single bottom address field at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await mockMapbox(page)
    await openPicker(page)
    const dialog = picker(page)
    await expect.poll(() => dialog.boundingBox()).toEqual({ x: 0, y: 0, ...viewport })
    const canvas = dialog.locator('.mapboxgl-canvas')
    const bounds = (await canvas.boundingBox())!
    expect(bounds.y).toBe(0)
    expect(bounds.width).toBe(viewport.width)
    expect(bounds.height).toBeGreaterThan(viewport.height * 0.6)
    const address = dialog.getByLabel('Поиск адреса')
    expect((await address.boundingBox())!.y).toBeGreaterThan(bounds.height - 16)
    await expect(dialog.getByLabel('Улица и дом')).toBeHidden()
    await expect(dialog.getByRole('textbox')).toHaveCount(1)
    await expect(dialog.getByRole('button', { name: 'Найти', exact: true })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Приблизить', exact: true })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Отдалить', exact: true })).toHaveCount(0)
    await expect(
      dialog.getByRole('button', { name: 'Сохранить адрес', exact: true }),
    ).toBeInViewport()
    await canvas.click({ position: { x: bounds.width / 2, y: bounds.height * 0.5 } })
    await expect(address).toHaveValue('Тверская улица, 7')
    await expect
      .poll(async () => {
        const marker = (await dialog.locator('.mapboxgl-marker').boundingBox())!
        return marker.y + marker.height
      })
      .toBeLessThan((await address.boundingBox())!.y)
    await dialog.screenshot({ path: test.info().outputPath('mobile-place-map.png') })
    await dialog.getByLabel('Поиск адреса').fill('Москва Тверская 7')
    await expect(
      dialog.getByRole('button', { name: 'Сохранить адрес', exact: true }),
    ).toBeDisabled()
    let searchRequests = 0
    page.on('request', (request) => {
      if (request.url().includes('/search/geocode/v6/forward')) searchRequests++
    })
    await address.press('Enter')
    await address.blur()
    await dialog.getByRole('button', { name: 'Тверская улица, 7 Москва, Россия' }).click()
    await expect(address).toHaveValue('Тверская улица, 7')
    expect(searchRequests).toBe(1)
    await dialog.getByRole('button', { name: 'Сохранить адрес', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByLabel('Адрес', { exact: true })).toHaveValue('Тверская улица, 7')
  })

  test(`searches on blur and preserves the chosen result at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await mockMapbox(page)
    await openPicker(page)
    const dialog = picker(page)
    const address = dialog.getByLabel('Поиск адреса')
    let searchRequests = 0
    page.on('request', (request) => {
      if (request.url().includes('/search/geocode/v6/forward')) searchRequests++
    })
    await address.fill('Москва Тверская 7')
    await address.blur()
    const result = dialog.getByRole('button', { name: 'Тверская улица, 7 Москва, Россия' })
    await expect(result).toBeVisible()
    await address.focus()
    await result.click()
    await expect(address).toHaveValue('Тверская улица, 7')
    await expect(dialog.getByRole('button', { name: 'Сохранить адрес', exact: true })).toBeEnabled()
    expect(searchRequests).toBe(1)
  })
}

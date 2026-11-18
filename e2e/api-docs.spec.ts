import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

for (const width of [1440, 375, 320]) {
  test(`API docs search, models and downloads work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    const apiRequests: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/v1')) apiRequests.push(request.url())
    })
    await page.goto('/api-docs')
    await expect(
      page.getByRole('heading', { name: 'API & модель данных', exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Проект контракта', { exact: true })).toBeVisible()
    await expect(page).toHaveTitle('API и модель данных — Tripper')
    await expect(page.locator('body')).not.toContainText('undefined')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('button', { name: /^API 53$/ }).click()
    await page.getByLabel('Поиск по API', { exact: true }).fill('/events')
    await page.getByLabel('HTTP-метод', { exact: true }).selectOption('POST')
    const endpoint = page.locator('details').filter({
      has: page.locator('summary code').getByText('/trips/{tripId}/events', { exact: true }),
    })
    await endpoint.locator('summary').first().click()
    await expect(endpoint.getByText('Организатор', { exact: true })).toBeVisible()
    await expect(endpoint.getByRole('heading', { name: 'Пример запроса' })).toBeVisible()
    await expect(endpoint.getByRole('heading', { name: 'Ответ · 201' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByLabel('Поиск по API', { exact: true }).fill('no-such-api')
    await expect(page.getByRole('heading', { name: 'Маршруты не найдены' })).toBeVisible()
    await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click()
    await expect(page.getByLabel('HTTP-метод', { exact: true })).toHaveValue('')
    await page.getByRole('button', { name: /^Таблицы ORM 13$/ }).click()
    await page.getByLabel('Поиск по таблицам', { exact: true }).fill('own_photo_media_id')
    await page.locator('summary').filter({ hasText: 'events' }).click()
    await expect(page.getByRole('cell', { name: 'own_photo_media_id', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'starts_at', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const openApiDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: 'OpenAPI JSON', exact: true }).click()
    const openApi = await openApiDownload
    const spec = JSON.parse(await readFile((await openApi.path())!, 'utf8'))
    expect(openApi.suggestedFilename()).toBe('tripper-openapi.json')
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.paths['/auth/registration'].post).toBeDefined()
    expect(spec.components.schemas.EventCreate.properties.category).toBeUndefined()
    const sqlDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Схема SQL', exact: true }).click()
    const sql = await sqlDownload
    expect(await readFile((await sql.path())!, 'utf8')).toContain('CREATE TABLE events')
    expect(sql.suggestedFilename()).toBe('tripper-schema.sql')
    expect(errors).toEqual([])
    expect(apiRequests).toEqual([])
  })
}

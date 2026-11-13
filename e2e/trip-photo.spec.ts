import { expect, test } from '@playwright/test'
import { Buffer } from 'node:buffer'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',
  'base64',
)

test('trip covers only use uploads, persist after reload and can be removed', async ({ page }) => {
  await page.goto('/trips')
  await page.getByRole('button', { name: 'Создать поездку', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('img')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
  await dialog.getByLabel('Название поездки').fill('Поездка со своим фото')
  await dialog.getByLabel('Начало поездки').fill('2026-11-20')
  await dialog.getByLabel('Конец поездки').fill('2026-11-25')
  await dialog
    .locator('input[type=file]')
    .setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: png })
  const preview = dialog.getByRole('img', { name: 'Выбранная обложка', exact: true })
  await expect(preview).toBeVisible()
  const uploaded = (await preview.getAttribute('src'))!
  await dialog.getByRole('button', { name: 'Создать поездку', exact: true }).click()
  await expect(page).toHaveURL(/\/trips\/[^/]+\/plan$/)
  const id = new URL(page.url()).pathname.split('/')[2]!
  await page.goto(`/trips/${id}/edit`)
  await expect(preview).toHaveAttribute('src', uploaded)
  await dialog.getByRole('button', { name: 'Удалить фото', exact: true }).click()
  await expect(dialog.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
  await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await page.reload()
  await page.goto(`/trips/${id}/edit`)
  await expect(dialog.locator('img')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
})

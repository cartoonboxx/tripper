import { expect, test } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',
  'base64',
)

test('uses the linked place photo in the form, card and details and follows photo changes', async ({
  page,
}) => {
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Место с обложкой события')
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'place.jpg',
    mimeType: 'image/jpeg',
    buffer: readFileSync('src/assets/images/gallery.jpg'),
  })
  const placePreview = dialog.getByRole('img', { name: 'Выбранное фото места' })
  await expect(placePreview).toBeVisible()
  const image = (await placePreview.getAttribute('src'))!
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await page.goto('/trips/florence/plan')
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  await dialog.getByLabel(/^Название/).fill('Событие с фото места')
  await dialog
    .getByLabel('Место', { exact: true })
    .selectOption({ label: 'Место с обложкой события' })
  await expect(dialog.getByRole('img', { name: 'Фото события' })).toHaveAttribute('src', image)
  await expect(dialog.locator('input[type=file]')).toBeDisabled()
  await expect(dialog.getByRole('button', { name: 'Заменить фото', exact: true })).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Добавить', exact: true }).click()
  const article = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Событие с фото места', exact: true }) })
  await expect(article.locator('img')).toHaveAttribute('src', image)
  await article.getByRole('button').first().click()
  await expect(
    dialog.getByRole('img', { name: 'Событие с фото места', exact: true }),
  ).toHaveAttribute('src', image)
  await page.keyboard.press('Escape')
  const replacement = `data:image/png;base64,${png.toString('base64')}`
  const eventId = await page.evaluate((replacement) => {
    const places = JSON.parse(localStorage.getItem('tripper:places')!)
    places.find(
      (place: { name: string; image: string }) => place.name === 'Место с обложкой события',
    ).image = replacement
    localStorage.setItem('tripper:places', JSON.stringify(places))
    const events = JSON.parse(localStorage.getItem('tripper:events')!)
    return events.find(
      (event: { title: string; id: string }) => event.title === 'Событие с фото места',
    ).id as string
  }, replacement)
  await page.reload()
  await expect(article.locator('img')).toHaveAttribute('src', replacement)
  await page.goto(`/trips/florence/events/${eventId}`)
  await expect(
    page.getByRole('img', { name: 'Событие с фото места', exact: true }),
  ).toHaveAttribute('src', replacement)
  await page.goto('/trips/florence/plan')
  await article.getByRole('button').nth(1).click()
  await dialog.getByLabel('Место', { exact: true }).selectOption('')
  await expect(dialog.getByRole('img', { name: 'Фото события' })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
  await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await expect(article.locator('img')).toHaveCount(0)
})

test('selects a saved place outside the trip, uploads a photo and retains both after reload', async ({
  page,
}) => {
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Место для события')
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await page.goto('/trips/florence/plan')
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  await dialog.getByLabel(/^Название/).fill('Событие со своим фото')
  await expect(dialog.getByRole('button', { name: 'Загрузить фото', exact: false })).toBeVisible()
  await dialog.getByLabel('Место', { exact: true }).click()
  await dialog.getByRole('button', { name: 'Место для события', exact: true }).click()
  const file = dialog.locator('input[type=file]')
  await file.setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  const preview = dialog.getByRole('img', { name: 'Фото события', exact: true })
  await expect(preview).toBeVisible()
  const uploaded = (await preview.getAttribute('src'))!
  await file.setInputFiles({
    name: 'bad.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid'),
  })
  await expect(
    dialog.getByText('Не удалось открыть изображение. Попробуйте другой файл.'),
  ).toBeVisible()
  await expect(preview).toHaveAttribute('src', uploaded)
  await dialog.getByRole('button', { name: 'Добавить', exact: true }).click()
  await page.reload()
  const article = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Событие со своим фото', exact: true }) })
  await expect(article.locator('img')).toHaveAttribute('src', uploaded)
  await expect(article.getByText('Место для события', { exact: true })).toBeVisible()
  await article.getByRole('button').nth(1).click()
  await expect(dialog.getByLabel('Место', { exact: true }).locator('option:checked')).toHaveText(
    'Место для события',
  )
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'new.jpg',
    mimeType: 'image/jpeg',
    buffer: readFileSync('src/assets/images/gallery.jpg'),
  })
  await expect(preview).not.toHaveAttribute('src', uploaded)
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
  await expect(article.locator('img')).toHaveAttribute('src', uploaded)
  await article.getByRole('button').nth(1).click()
  await dialog.getByRole('button', { name: 'Удалить фото', exact: true }).click()
  await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await page.reload()
  await expect(article.locator('img')).toHaveCount(0)
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  await expect(dialog.getByRole('button', { name: 'Загрузить фото', exact: false })).toBeVisible()
})

test('rejects unsupported and oversized event photos on mobile and allows saving without a photo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/trips/florence/plan')
  await page.getByRole('button', { name: /^День 4\b/ }).click()
  await page.getByRole('button', { name: 'Добавить событие', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Дата', { exact: true })).toHaveCount(0)
  await dialog.getByLabel(/^Название/).fill('Без фотографии')
  await dialog.getByLabel('Начало', { exact: false }).fill('14:35')
  await expect(dialog.getByLabel('Окончание', { exact: false })).toHaveValue('15:35')
  const file = dialog.locator('input[type=file]')
  for (const upload of [
    { name: 'text.txt', mimeType: 'text/plain', buffer: Buffer.from('text') },
    { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(1024 * 1024 + 1) },
  ]) {
    await file.setInputFiles(upload)
    await expect(dialog.getByText('Выберите JPG, PNG или WebP размером до 1 МБ.')).toBeVisible()
  }
  await dialog.getByRole('button', { name: 'Добавить', exact: true }).click()
  const article = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Без фотографии', exact: true }) })
  await expect(article).toBeVisible()
  await expect(article.locator('img')).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const events = JSON.parse(localStorage.getItem('tripper:events') || '[]')
        return events.find(
          (event: { title: string; day: string }) => event.title === 'Без фотографии',
        )?.day
      }),
    )
    .toBe('2026-11-13')
})

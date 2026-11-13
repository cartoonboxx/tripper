import { expect, test } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',
  'base64',
)

test('place photos can be uploaded, saved, replaced and cancelled without changing saved data', async ({
  page,
}) => {
  await page.goto('/places')
  await page.getByRole('button', { name: 'Добавить место', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Название/).fill('Место с фото')
  const file = dialog.locator('input[type=file]')
  await expect(dialog.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
  await file.setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  const preview = dialog.getByRole('img', { name: 'Выбранное фото места', exact: true })
  await expect(preview).toBeVisible()
  const uploaded = await preview.getAttribute('src')
  await file.setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('text'),
  })
  await expect(dialog.getByText('Выберите JPG, PNG или WebP размером до 1 МБ.')).toBeVisible()
  await expect(preview).toHaveAttribute('src', uploaded!)
  await file.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not an image'),
  })
  await expect(
    dialog.getByText('Не удалось открыть изображение. Попробуйте другой файл.'),
  ).toBeVisible()
  await file.setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  await expect(dialog.getByRole('button', { name: 'Сохранить место', exact: true })).toBeEnabled()
  await dialog.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('img', { name: 'Место с фото', exact: true })).toHaveAttribute(
    'src',
    uploaded!,
  )
  await page.getByRole('button', { name: 'Место с фото', exact: true }).last().click()
  await expect(dialog.getByRole('button', { name: 'Добавить в поездку', exact: true })).toHaveCount(
    0,
  )
  await dialog.getByRole('button', { name: 'Редактировать', exact: true }).click()
  const edit = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Редактировать место', exact: true }) })
  await expect(edit.getByRole('img', { name: 'Выбранное фото места' })).toHaveAttribute(
    'src',
    uploaded!,
  )
  await edit.locator('input[type=file]').setInputFiles({
    name: 'new.jpg',
    mimeType: 'image/jpeg',
    buffer: readFileSync('src/assets/images/gallery.jpg'),
  })
  await expect(edit.getByRole('img', { name: 'Выбранное фото места' })).not.toHaveAttribute(
    'src',
    uploaded!,
  )
  await edit.getByRole('button', { name: 'Отмена', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Место с фото', exact: true }).last().click()
  await expect(dialog.getByRole('img', { name: 'Место с фото', exact: true })).toHaveAttribute(
    'src',
    uploaded!,
  )
  await dialog.getByRole('button', { name: 'Редактировать', exact: true }).click()
  await edit.locator('input[type=file]').setInputFiles({
    name: 'new.jpg',
    mimeType: 'image/jpeg',
    buffer: readFileSync('src/assets/images/gallery.jpg'),
  })
  await expect(edit.getByRole('img', { name: 'Выбранное фото места' })).toHaveAttribute(
    'src',
    /^data:image\/jpeg;base64,/,
  )
  const replacement = await edit
    .getByRole('img', { name: 'Выбранное фото места' })
    .getAttribute('src')
  await edit.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('img', { name: 'Место с фото', exact: true })).toHaveAttribute(
    'src',
    replacement!,
  )
  await page.getByRole('button', { name: 'Место с фото', exact: true }).last().click()
  await dialog.getByRole('button', { name: 'Редактировать', exact: true }).click()
  await edit.getByRole('button', { name: 'Удалить фото', exact: true }).click()
  await expect(edit.getByRole('button', { name: /Загрузить фото/ })).toBeVisible()
  await edit.getByRole('button', { name: 'Сохранить место', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('img', { name: 'Место с фото', exact: true })).toHaveCount(0)
})

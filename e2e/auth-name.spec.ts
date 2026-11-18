import { expect, test } from '@playwright/test'

for (const width of [1440, 375]) {
  test(`registers by name without email and logs in with the generated password at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/registration')
    await page.getByLabel('Введите только имя', { exact: true }).fill('Путешественник')
    await expect(page.getByLabel('Электронная почта', { exact: true })).toBeDisabled()
    await expect(page.getByLabel(/^Пароль/)).toBeDisabled()
    await page.getByRole('button', { name: 'Создать аккаунт', exact: true }).click()
    await expect(page.getByText('Подтвердите согласие с локальным хранением данных.')).toBeVisible()
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Создать аккаунт', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Аккаунт создан', exact: true })).toBeVisible()
    const password = await page.getByLabel('Сгенерированный пароль', { exact: true }).inputValue()
    expect(password).toMatch(/^[a-f0-9]{32}$/)
    const stored = await page.evaluate(() => ({
      profile: JSON.parse(localStorage.getItem('tripper:profile')!),
      data: Object.values(localStorage).join(''),
    }))
    expect(stored.profile).toMatchObject({ name: 'Путешественник', email: '' })
    expect(stored.data).not.toContain(password)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('link', { name: 'Продолжить', exact: true }).click()
    await expect(page).toHaveURL('/')
    await page.reload()
    await page.goto('/settings')
    await expect(page.getByLabel('Электронная почта', { exact: true })).toHaveValue('')
    await page.getByRole('button', { name: 'Сохранить изменения', exact: true }).click()
    await expect(page.getByText('Профиль обновлён', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Выйти', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Выйти', exact: true }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.reload()
    await page.getByLabel(/^Имя пользователя/).fill('Путешественник')
    await page.getByLabel(/^Пароль/).fill('incorrect-password')
    await page.getByRole('button', { name: 'Войти', exact: true }).click()
    await expect(page.getByText('Неверное имя пользователя или пароль.')).toBeVisible()
    await page.getByLabel(/^Пароль/).fill(password)
    await page.getByRole('button', { name: 'Войти', exact: true }).click()
    await expect(page).toHaveURL('/')
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('tripper:profile')!).email),
    ).toBe('')
  })
}

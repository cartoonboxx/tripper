import { expect, test, type Locator } from '@playwright/test'

const cases = [
  {
    field: 'Направление',
    choose: (popup: Locator) => popup.getByRole('button', { name: 'Португалия', exact: true }),
  },
  {
    field: 'Дата в календаре',
    choose: (popup: Locator) => popup.locator('button[value="2026-11-15"]'),
  },
  {
    field: 'Время в списке',
    choose: (popup: Locator) => popup.getByRole('button', { name: 'Готово', exact: true }),
  },
]

for (const { field, choose } of cases) {
  test(`${field} releases focus after pointer selection and outside clicks`, async ({ page }) => {
    await page.goto('/ui-kit')
    const control = page.getByLabel(field, { exact: true })
    const wrapper = control.locator('..')
    const popup = page.locator('[popover]:popover-open')
    await control.click()
    await expect(popup).toBeVisible()
    await choose(popup).click()
    await expect(popup).toHaveCount(0)
    await expect
      .poll(() => wrapper.evaluate((element) => element.matches(':focus-within')))
      .toBe(false)

    await control.click()
    await expect(popup).toBeVisible()
    await page.getByRole('heading', { name: 'UI-kit', exact: true }).click()
    await expect(popup).toHaveCount(0)
    await expect
      .poll(() => wrapper.evaluate((element) => element.matches(':focus-within')))
      .toBe(false)

    await control.click()
    await expect(popup).toBeVisible()
    const next = page.getByLabel('Многострочные заметки', { exact: true }).first()
    await next.click()
    await expect(popup).toHaveCount(0)
    await expect(next).toBeFocused()
    await expect
      .poll(() => wrapper.evaluate((element) => element.matches(':focus-within')))
      .toBe(false)
  })

  test(`${field} restores keyboard focus on Escape and lets Tab leave the popup`, async ({
    page,
  }) => {
    await page.goto('/ui-kit')
    const control = page.getByLabel(field, { exact: true })
    const wrapper = control.locator('..')
    const popup = page.locator('[popover]:popover-open')
    await control.focus()
    await control.press('Enter')
    await expect(popup).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)
    await expect
      .poll(() => wrapper.evaluate((element) => element.matches(':focus-within')))
      .toBe(true)

    await control.press('Enter')
    await expect(popup).toBeVisible()
    await popup.getByRole('button').last().focus()
    await page.keyboard.press('Tab')
    await expect(popup).toHaveCount(0)
    await expect
      .poll(() => wrapper.evaluate((element) => element.matches(':focus-within')))
      .toBe(false)
  })
}

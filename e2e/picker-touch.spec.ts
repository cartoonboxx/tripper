import { expect, test } from '@playwright/test'

test.use({ hasTouch: true, viewport: { width: 375, height: 812 } })

test('touch opens custom calendar, clock and select instead of native pickers', async ({
  page,
}) => {
  await page.goto('/ui-kit')
  const popup = page.locator('[popover]:popover-open')
  const select = page.getByRole('combobox', { name: 'Направление', exact: true })
  await select.tap()
  await popup.getByRole('button', { name: 'Португалия', exact: true }).tap()
  await expect(select).toHaveValue('portugal')
  const date = page.getByLabel('Дата в календаре', { exact: true })
  await date.tap()
  await popup.locator('button[value="2026-11-20"]').tap()
  await expect(date).toHaveValue('20.11.2026')
  const time = page.getByLabel('Время в списке', { exact: true })
  await time.tap()
  await popup
    .getByRole('group', { name: 'Часы' })
    .getByRole('button', { name: '12', exact: true })
    .tap()
  await popup
    .getByRole('group', { name: 'Минуты' })
    .getByRole('button', { name: '15', exact: true })
    .tap()
  await popup.getByRole('button', { name: 'Готово', exact: true }).tap()
  await expect(time).toHaveValue('12:15')
  await expect(popup).toHaveCount(0)
})

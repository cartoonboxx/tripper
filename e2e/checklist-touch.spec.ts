import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true })

test('a held handle reorders items with a native touch gesture', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('tripper:checklists')) return
    localStorage.setItem(
      'tripper:checklists',
      JSON.stringify([
        {
          id: 'touch',
          title: 'Сборы',
          tripId: '',
          items: ['Паспорт', 'Билеты', 'Зарядка'].map((title, index) => ({
            id: `touch-${index}`,
            title,
            checked: index === 0,
          })),
        },
      ]),
    )
  })
  await page.goto('/checklists')
  const handles = page.getByRole('button', { name: /^Переместить/ })
  const source = (await handles.first().boundingBox())!
  const target = (await handles.last().boundingBox())!
  const row = page.getByRole('button', { name: 'Переместить Паспорт', exact: true }).locator('..')
  const client = await page.context().newCDPSession(page)
  const x = source.x + source.width / 2
  const y = source.y + source.height / 2
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await expect(row).toHaveCSS('position', 'fixed')
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x, y: target.y + target.height }],
  })
  await expect(handles.last()).toHaveText('Переместить Паспорт')
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(row).toHaveCSS('position', 'relative')
  await page.reload()
  await expect(handles).toHaveText([
    'Переместить Билеты',
    'Переместить Зарядка',
    'Переместить Паспорт',
  ])
  await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).toBeChecked()
})

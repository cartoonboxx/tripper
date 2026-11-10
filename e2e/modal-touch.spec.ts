import { expect, test, type CDPSession, type Locator } from '@playwright/test'

async function swipe(
  client: CDPSession,
  target: Locator,
  distance: number,
  end: 'touchEnd' | 'touchCancel' = 'touchEnd',
) {
  const bounds = await target.boundingBox()
  expect(bounds).not.toBeNull()
  const x = bounds!.x + bounds!.width / 2
  const y = bounds!.y + bounds!.height / 2
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  })
  for (let step = 1; step <= 6; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y + (distance * step) / 6 }],
    })
  }
  await client.send('Input.dispatchTouchEvent', { type: end, touchPoints: [] })
}

test.describe('mobile modal touch input', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true })

  test('touch gestures close from the handle, header and body, but not after a short or cancelled drag', async ({
    page,
  }) => {
    await page.goto('/ui-kit')
    const client = await page.context().newCDPSession(page)
    const opener = page.getByRole('button', { name: 'Открыть Modal', exact: true })
    const dialog = page.getByRole('dialog')
    const panel = dialog.locator('section')
    const handle = panel.locator(':scope > div').first()
    const header = dialog.getByRole('heading', { name: 'Планы на новый день', exact: true })
    const bodyText = dialog.getByText(
      'Плавное открытие и закрытие. На телефоне потяните ручку вниз.',
    )

    await opener.tap()
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await swipe(client, handle, 25)
    await expect(dialog).toBeVisible()
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await swipe(client, header, 150, 'touchCancel')
    await expect(dialog).toBeVisible()
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)

    for (const target of [handle, header, bodyText]) {
      await opener.tap()
      await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      await swipe(client, target, 150)
      await expect(dialog).toHaveCount(0)
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    }
  })

  test('touch scrolling and gestures on form controls keep a long modal open', async ({ page }) => {
    await page.goto('/')
    const client = await page.context().newCDPSession(page)
    await page.getByRole('button', { name: 'Создать поездку', exact: true }).tap()
    const dialog = page.getByRole('dialog')
    const panel = dialog.locator('section')
    const body = panel.locator(':scope > div').last()
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

    await swipe(client, body, -150)
    await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await expect(dialog).toBeVisible()
    await swipe(client, body, 150)
    await expect(dialog).toBeVisible()
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')

    const name = dialog.getByLabel('Название поездки')
    await name.fill('Поездка после свайпа')
    await swipe(client, name, 150)
    await expect(dialog).toBeVisible()
    await expect(name).toHaveValue('Поездка после свайпа')
    await swipe(
      client,
      dialog.getByRole('heading', { name: 'Новое путешествие', exact: true }),
      150,
    )
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
})

import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 1200 } })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) =>
          failure({ code: 1 } as GeolocationPositionError),
      },
    })
    const today = new Date()
    const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (!localStorage.getItem('tripper:events')) {
      localStorage.setItem(
        'tripper:events',
        JSON.stringify(
          ['Первое', 'Второе', 'Третье'].map((title, index) => ({
            id: `reorder-${index}`,
            tripId: 'florence',
            day,
            title,
            start: `${10 + index * 2}:00`,
            end: `${11 + index * 2}:00`,
            place: '',
            description: '',
            image: '',
            category: 'Прогулка',
          })),
        ),
      )
    }
  })
  await page.goto('/trips/florence/today')
})

test('inserts a held card past multiple events, shows its position and persists on release', async ({
  page,
}) => {
  const cards = page.getByRole('article')
  const first = cards.filter({ has: page.getByRole('heading', { name: 'Первое', exact: true }) })
  await first.getByRole('heading').hover()
  const source = (await first.getByRole('heading').boundingBox())!
  const original = (await first.boundingBox())!
  const target = (await cards.last().boundingBox())!
  const startX = source.x + source.width / 2
  const startY = source.y + source.height / 2
  const endY = target.y + target.height * 0.8
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await expect(first).toHaveCSS('position', 'fixed')
  await page.mouse.move(startX + 20, endY, { steps: 10 })
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Второе', 'Третье', 'Первое'])
  await expect
    .poll(async () => Math.abs((await first.boundingBox())!.y - (original.y + endY - startY)))
    .toBeLessThan(2)
  await expect
    .poll(async () => Math.abs((await first.boundingBox())!.x - (original.x + 20)))
    .toBeLessThan(2)
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tripper:events')!).map(
        (event: { title: string }) => event.title,
      ),
    ),
  ).toEqual(['Первое', 'Второе', 'Третье'])
  await page.mouse.up()
  await expect(first).toHaveCSS('position', 'relative')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(cards.nth(0)).toContainText('10:00')
  await expect(cards.nth(1)).toContainText('12:00')
  await expect(first).toContainText('14:00')
  await page.reload()
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Второе', 'Третье', 'Первое'])
})

test('Escape restores the order and a short click still opens event details', async ({ page }) => {
  const cards = page.getByRole('article')
  const first = cards.filter({ has: page.getByRole('heading', { name: 'Первое', exact: true }) })
  await first.getByRole('heading').hover()
  const source = (await first.getByRole('heading').boundingBox())!
  const target = (await cards.last().boundingBox())!
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await expect(first).toHaveCSS('position', 'fixed')
  await page.mouse.move(source.x + source.width / 2, target.y + target.height * 0.8)
  await expect(cards.last()).toContainText('Первое')
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Первое', 'Второе', 'Третье'])
  await expect(first).toHaveCSS('position', 'relative')
  // Reload also verifies that the cancelled preview was never persisted.
  await page.reload()
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Первое', 'Второе', 'Третье'])
  await first.getByRole('heading').click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

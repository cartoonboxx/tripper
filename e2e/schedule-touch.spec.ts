import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true })

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
    localStorage.setItem(
      'tripper:events',
      JSON.stringify([
        {
          id: 'touch1',
          tripId: 'florence',
          day,
          title: 'Первое событие',
          start: '10:00',
          end: '11:00',
          place: '',
          description: '',
          image: '',
          category: 'Прогулка',
        },
        {
          id: 'touch2',
          tripId: 'florence',
          day,
          title: 'Второе событие',
          start: '12:00',
          end: '14:00',
          place: '',
          description: '',
          image: '',
          category: 'Прогулка',
        },
      ]),
    )
  })
  await page.goto('/trips/florence/today')
})

test('a swipe before the hold scrolls the page without reordering or opening details', async ({
  page,
}) => {
  const cards = page.getByRole('article')
  const heading = cards.first().getByRole('heading', { level: 3 })
  await heading.scrollIntoViewIfNeeded()
  const source = (await heading.boundingBox())!
  const before = await page.evaluate(() => scrollY)
  const client = await page.context().newCDPSession(page)
  const x = source.x + source.width / 2
  const y = source.y + source.height / 2
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let step = 1; step <= 5; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y - step * 25 }],
    })
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before)
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText([
    'Первое событие',
    'Второе событие',
  ])
  await expect(cards.first()).toHaveCSS('position', 'relative')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

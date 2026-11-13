import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('tripper:checklists')) return
    localStorage.setItem(
      'tripper:checklists',
      JSON.stringify([
        {
          id: 'personal',
          title: 'Сборы',
          tripId: '',
          items: ['Паспорт', 'Билеты', 'Зарядка'].map((title, index) => ({
            id: `item-${index}`,
            title,
            checked: index === 0,
          })),
        },
        { id: 'other', title: 'Другой список', tripId: '', items: [] },
      ]),
    )
  })
  await page.goto('/checklists')
})

for (const width of [1440, 375, 320]) {
  test(`previews and persists item order without changing checkmarks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const handles = page.getByRole('button', { name: /^Переместить/ })
    const first = handles.filter({ hasText: 'Паспорт' })
    const row = first.locator('..')
    const source = (await first.boundingBox())!
    const target = (await handles.last().boundingBox())!
    const x = source.x + source.width / 2
    await page.mouse.move(x, source.y + source.height / 2)
    await page.mouse.down()
    await expect(row).toHaveCSS('position', 'fixed')
    await page.mouse.move(x, target.y + target.height, { steps: 10 })
    await expect(handles).toHaveText([
      'Переместить Билеты',
      'Переместить Зарядка',
      'Переместить Паспорт',
    ])
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem('tripper:checklists')!)[0].items.map(
          (item: { title: string }) => item.title,
        ),
      ),
    ).toEqual(['Паспорт', 'Билеты', 'Зарядка'])
    await page.mouse.up()
    await expect(row).toHaveCSS('position', 'relative')
    await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).toBeChecked()
    await page.reload()
    await expect(handles).toHaveText([
      'Переместить Билеты',
      'Переместить Зарядка',
      'Переместить Паспорт',
    ])
    await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).toBeChecked()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('Escape cancels a drag and checkboxes still toggle on a short click', async ({ page }) => {
  const handles = page.getByRole('button', { name: /^Переместить/ })
  const first = handles.first()
  const row = first.locator('..')
  const source = (await first.boundingBox())!
  const target = (await handles.last().boundingBox())!
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await expect(row).toHaveCSS('position', 'fixed')
  await page.mouse.move(source.x, target.y + target.height)
  await expect(handles.last()).toHaveText('Переместить Паспорт')
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await page.reload()
  await expect(handles).toHaveText([
    'Переместить Паспорт',
    'Переместить Билеты',
    'Переместить Зарядка',
  ])
  await page.getByRole('checkbox', { name: 'Паспорт', exact: true }).uncheck()
  await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).not.toBeChecked()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('arrow keys reorder items from the handle and preserve the order after reload', async ({
  page,
}) => {
  const handle = page.getByRole('button', { name: 'Переместить Паспорт', exact: true })
  await handle.focus()
  await handle.press('ArrowDown')
  await expect(page.getByRole('button', { name: /^Переместить/ })).toHaveText([
    'Переместить Билеты',
    'Переместить Паспорт',
    'Переместить Зарядка',
  ])
  await expect(handle).toBeFocused()
  await page.reload()
  await expect(page.getByRole('button', { name: /^Переместить/ })).toHaveText([
    'Переместить Билеты',
    'Переместить Паспорт',
    'Переместить Зарядка',
  ])
})

test('trip checklists save their order and viewers cannot reorder them', async ({ page }) => {
  await page.evaluate(() => {
    const lists = JSON.parse(localStorage.getItem('tripper:checklists')!)
    lists[0].tripId = 'florence'
    localStorage.setItem('tripper:checklists', JSON.stringify(lists))
  })
  await page.goto('/trips/florence/checklists')
  await page.getByRole('button', { name: 'Переместить Паспорт', exact: true }).press('ArrowDown')
  await page.reload()
  await expect(page.getByRole('button', { name: /^Переместить/ })).toHaveText([
    'Переместить Билеты',
    'Переместить Паспорт',
    'Переместить Зарядка',
  ])
  await page.evaluate(() => {
    const trips = JSON.parse(localStorage.getItem('tripper:trips')!)
    trips.find((trip: { id: string }) => trip.id === 'florence').role = 'viewer'
    localStorage.setItem('tripper:trips', JSON.stringify(trips))
  })
  await page.reload()
  await expect(page.getByRole('button', { name: /^Переместить/ })).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: 'Паспорт', exact: true })).toBeDisabled()
})

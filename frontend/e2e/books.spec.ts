import { expect, test } from '@playwright/test'

// Unique suffix so repeated runs against the same dev database do not collide.
const run = Date.now()

test('adds a book with a new author and shows it in the list', async ({ page }) => {
  const title = `E2E Book ${run}`
  const author = `E2E Author ${run}`

  await page.goto('/')
  await page.getByLabel('Title', { exact: true }).fill(title)
  await page.getByLabel('Available copies', { exact: true }).fill('2')
  await page.getByLabel('Author', { exact: true }).selectOption('new')
  await page.getByLabel('New author name').fill(author)
  await page.getByRole('button', { name: 'Add book' }).click()

  const row = page.getByRole('row', { name: new RegExp(title) })
  await expect(row).toBeVisible()
  await expect(row).toContainText(author)
})

test('updates available copies for an existing book', async ({ page }) => {
  const title = `E2E Copies ${run}`

  await page.goto('/')
  await page.getByLabel('Title', { exact: true }).fill(title)
  await page.getByLabel('Author', { exact: true }).selectOption('new')
  await page.getByLabel('New author name').fill(`Copies Author ${run}`)
  await page.getByRole('button', { name: 'Add book' }).click()

  const row = page.getByRole('row', { name: new RegExp(title) })
  await expect(row).toBeVisible()
  await row.getByLabel(`Available copies for ${title}`).fill('7')
  await row.getByRole('button', { name: 'Save copies' }).click()

  await page.reload()
  await expect(page.getByRole('row', { name: new RegExp(title) }).getByLabel(`Available copies for ${title}`)).toHaveValue('7')
})

test('submits the add-book form using only the keyboard', async ({ page }) => {
  const title = `E2E Keyboard ${run}`

  await page.goto('/')
  await page.getByLabel('Title', { exact: true }).focus()
  await page.keyboard.type(title)
  await page.keyboard.press('Tab') // ISBN
  await page.keyboard.press('Tab') // Available copies
  await page.keyboard.press('Tab') // Author
  await page.getByLabel('Author', { exact: true }).selectOption('new')
  await page.keyboard.press('Tab') // New author name
  await page.keyboard.type(`Keyboard Author ${run}`)
  await page.keyboard.press('Enter')

  await expect(page.getByRole('row', { name: new RegExp(title) })).toBeVisible()
})

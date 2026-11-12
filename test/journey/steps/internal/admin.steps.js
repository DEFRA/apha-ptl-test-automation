/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import { When, Then, expect } from '../../support/fixtures.js'
import { textPattern } from '../../support/text.js'

// source: Features/SystemAdministration, SchemeAdmin, Scheme, Distribution controllers and views; live probe docs/internal/discovery

const unique = (runId) => `QAT${runId.replace(/[^a-z0-9]/gi, '')}`
const button = (page, name) => page.getByRole('button', { name, exact: true })
// Text controls only: a tab or hidden panel can share the label, and hidden panels still carry the attribute.
const field = (page, label) => page.locator('input:not([type=hidden]), textarea').and(page.getByLabel(label, { exact: true })).first()
const banner = (page) => page.locator('.govuk-notification-banner').filter({ hasNotText: 'Extend session' })

// ---- generic ----------------------------------------------------------------

When('the user goes to {string}', async ({ page }, path) => {
  await page.goto(path)
})

Then('the page heading is {string}', async ({ page }, heading) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(textPattern(heading))
})

Then('the first field labelled {string} accepts at most {int} characters', async ({ page }, label, max) => {
  await expect(field(page, label)).toHaveAttribute('maxlength', String(max))
})

Then('the first table has the columns {string}', async ({ page }, columns) => {
  const headers = page.getByRole('table').first().getByRole('columnheader')
  const expected = columns.split(',').map((c) => c.trim())
  await expect(headers.first()).toBeVisible()
  const actual = (await headers.allTextContents()).map((c) => c.replace(/\s+/g, ' ').trim())
  expect(actual.slice(0, expected.length)).toEqual(expected)
})

When('the user presses {string}', async ({ page }, name) => {
  await button(page, name).click()
})

When('the user fills the field containing {string} with {string}', async ({ page }, label, value) => {
  await page.getByLabel(label).first().fill(value)
})

When('the user fills {string} with {string}', async ({ page }, label, value) => {
  await field(page, label).fill(value)
})

Then('the page shows no error summary', async ({ page }) => {
  await expect(page.locator('.govuk-error-summary')).toHaveCount(0)
})

Then('the page still has the heading {string}', async ({ page }, heading) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(textPattern(heading))
})

// ---- selectors, paging ------------------------------------------------------

When('the user views the second option of the selector {string}', async ({ page, state }, label) => {
  const select = page.getByLabel(label, { exact: true })
  const option = select.locator('option').nth(1)
  state.option = (await option.textContent()).trim()
  await select.selectOption({ index: 1 })
  await button(page, 'View').click()
})

Then('the selector {string} shows the chosen option', async ({ page, state }, label) => {
  await expect(page.getByLabel(label, { exact: true }).locator('option:checked')).toHaveText(state.option)
})

When('the user sets items per page to {int}', async ({ page }, size) => {
  await page.getByLabel('Items per page', { exact: true }).selectOption({ label: String(size) })
})

Then('the first table shows at most {int} rows', async ({ page }, max) => {
  await expect.poll(async () => page.getByRole('table').first().locator('tbody tr').count()).toBeLessThanOrEqual(max)
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible()
})

When('the user goes to the next page of results', async ({ page }) => {
  await page.locator('.govuk-pagination').getByRole('link', { name: /next/i }).first().click()
})

Then('the address shows page {int}', async ({ page }, n) => {
  await expect(page).toHaveURL(new RegExp(`page=${n}\\b`))
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible()
})

// ---- scheme search ----------------------------------------------------------

When('the user remembers the name of the first scheme in the list', async ({ page, state }) => {
  await page.goto('/Scheme/Index')
  const row = page.getByRole('table').first().locator('tbody tr').first()
  state.schemeName = (await row.getByRole('cell').nth(1).textContent()).trim()
})

When('the user searches schemes by {word} text of that name', async ({ page, state }, style) => {
  const part = state.schemeName.slice(0, Math.max(3, Math.ceil(state.schemeName.length / 2)))
  const value = { partial: part, uppercase: part.toUpperCase(), lowercase: part.toLowerCase(), exact: state.schemeName }[style]
  await page.goto('/Scheme/Search')
  await page.getByLabel('Scheme Name', { exact: true }).fill(value)
  await button(page, 'Search').click()
})

Then('the scheme search results include that scheme', async ({ page, state }) => {
  await expect(page.getByRole('table').first().getByText(state.schemeName, { exact: true }).first()).toBeVisible()
})

// ---- country CRUD (Add stages a row; Save persists; Cancel discards) --------

const removeCountryIfPresent = async (page, name) => {
  await page.goto('/SystemAdministration/CountryManagement')
  const remove = page.getByRole('button', { name: `Remove country ${name}` })
  if (await remove.count()) {
    await remove.click()
    await button(page, 'Save').first().click()
  }
}

When('the user stages a new country with a unique name', async ({ page, state, runId, cleanup }) => {
  state.name = unique(runId)
  await cleanup(() => removeCountryIfPresent(page, state.name))
  await page.goto('/SystemAdministration/CountryManagement')
  await page.getByLabel('Name', { exact: true }).fill(state.name)
  await button(page, 'Add').click()
})

Then('the staged country is listed with edit and remove actions', async ({ page, state }) => {
  await expect(page.getByRole('button', { name: `Edit country ${state.name}` })).toBeVisible()
  await expect(page.getByRole('button', { name: `Remove country ${state.name}` })).toBeVisible()
})

When('the user saves the staged changes', async ({ page }) => {
  await button(page, 'Save').first().click()
})

When('the user discards the staged changes', async ({ page }) => {
  await button(page, 'Cancel').first().click()
})

Then('the user is told that the countries were saved', async ({ page }) => {
  await expect(banner(page)).toContainText('Countries saved successfully.')
})

const countryRemoveButton = (page, state) => page.getByRole('button', { name: `Remove country ${state.name}` })

Then('the country is listed in the country list', async ({ page, state }) => {
  await page.goto('/SystemAdministration/CountryManagement')
  await expect(countryRemoveButton(page, state)).toHaveCount(1)
})

Then('the country is not listed in the country list', async ({ page, state }) => {
  await page.goto('/SystemAdministration/CountryManagement')
  await expect(countryRemoveButton(page, state)).toHaveCount(0)
})

When('the user removes that country and saves', async ({ page, state }) => {
  await page.goto('/SystemAdministration/CountryManagement')
  await page.getByRole('button', { name: `Remove country ${state.name}` }).click()
  await button(page, 'Save').first().click()
})

// ---- staged people lists: viewers and test consultants ----------------------

When('the user stages a viewer with a unique name and email', async ({ page, state, runId }) => {
  state.name = unique(runId)
  await page.goto('/SystemAdministration/ViewerManagement')
  await page.getByLabel('Name', { exact: true }).fill(state.name)
  await page.getByLabel('Email', { exact: true }).fill(`${state.name.toLowerCase()}@example.com`)
  await button(page, 'Add').click()
})

Then('the staged viewer is listed', async ({ page, state }) => {
  await expect(page.getByRole('button', { name: `Remove viewer ${state.name}` })).toBeVisible()
})

const viewerRemoveButton = (page, state) => page.getByRole('button', { name: `Remove viewer ${state.name}` })

Then('the viewer is not listed in the viewer list', async ({ page, state }) => {
  await page.goto('/SystemAdministration/ViewerManagement')
  await expect(viewerRemoveButton(page, state)).toHaveCount(0)
})

// ---- scheme admin item lists (Add and Yes, remove persist at once) ----------

// The lists are paged and sorted, so a new item can sit on any page: walk the pages until the item is found.
const openPageWithItem = async (page, path, name) => {
  for (let n = 1; n <= 20; n++) {
    await page.goto(`${path}?page=${n}`)
    if (await page.locator('main tr', { hasText: name }).count()) return true
    if ((await page.locator('main table tbody tr').count()) === 0) return false
  }
  return false
}

const removeItemIfPresent = async (page, path, name) => {
  if (await openPageWithItem(page, path, name)) {
    await page.locator('main tr', { hasText: name }).first().getByRole('link', { name: 'Remove' }).click()
    await button(page, 'Yes, remove').click()
  }
}

When('the user adds an item with a unique name to the list at {string} using the field {string}', async ({ page, state, runId, cleanup }, path, label) => {
  state.name = unique(runId)
  state.path = path
  await cleanup(() => removeItemIfPresent(page, path, state.name))
  await page.goto(path)
  await page.getByLabel(label, { exact: true }).fill(state.name)
  await button(page, 'Add').click()
})

Then('the item is listed in its list', async ({ state, page }) => {
  expect(await openPageWithItem(page, state.path, state.name), `${state.name} listed in ${state.path}`).toBe(true)
})

Then('the item is not listed in its list', async ({ state, page }) => {
  expect(await openPageWithItem(page, state.path, state.name), `${state.name} listed in ${state.path}`).toBe(false)
})

When('the user starts removing the item', async ({ page, state }) => {
  expect(await openPageWithItem(page, state.path, state.name)).toBe(true)
  await page.locator('main tr', { hasText: state.name }).first().getByRole('link', { name: 'Remove' }).click()
})
Then('the user is asked to confirm the removal', async ({ page }) => {
  await expect(button(page, 'Yes, remove')).toBeVisible()
})

When('the user declines the removal', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel', exact: true }).or(page.getByRole('link', { name: 'Cancel', exact: true })).first().click()
})

When('the user confirms the removal', async ({ page }) => {
  await button(page, 'Yes, remove').click()
})




/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests; move to *.assertions.js when next edited */
import { When, Then, expect } from '../../support/fixtures.js'
import { internal } from '../../content/internal.js'

// source: Features/Search/Views/Index.cshtml, SearchController.cs, SearchViewModel.cs

const s = internal.search
const labelOf = (key) => s.labels[key]
const resultsRows = (page, tab) => page.locator(`#${tab}`).getByRole('table').getByRole('row').filter({ has: page.locator('td') })

When('the user opens the internal search page', async ({ page }) => {
  await page.goto(internal.routes.search)
})

Then('the search page offers the Customers and Participants tabs', async ({ page }) => {
  await expect(page.getByRole('tab', { name: s.customerTab, exact: true })).toBeVisible() // source: govuk-frontend tabs sets role=tab
  await expect(page.getByRole('tab', { name: s.participantTab, exact: true })).toBeVisible()
})

When('the user opens the Participants search tab', async ({ page }) => {
  await page.getByRole('tab', { name: s.participantTab, exact: true }).click()
})

When('the user searches customers with no criteria', async ({ page }) => {
  await page.locator('#customers').getByRole('button', { name: s.searchButton, exact: true }).click()
})

When('the user searches customers by {word} {string}', async ({ page }, field, value) => {
  await page.getByLabel(labelOf(field), { exact: true }).first().fill(value)
  await page.locator('#customers').getByRole('button', { name: s.searchButton, exact: true }).click()
})

When('the user searches customers by the {word} of the seed customer using {word} text', async ({ page, state }, field, style) => {
  const full = state.seed[field]
  const part = full.slice(0, Math.max(2, Math.ceil(full.length / 2)))
  const value = { partial: part, uppercase: part.toUpperCase(), lowercase: part.toLowerCase(), exact: full }[style]
  state.term = value
  await page.getByLabel(labelOf(field), { exact: true }).first().fill(value)
  await page.locator('#customers').getByRole('button', { name: s.searchButton, exact: true }).click()
})

When('the user searches participants by {word} {string}', async ({ page }, field, value) => {
  await page.locator('#participants').getByLabel(labelOf(field), { exact: true }).fill(value)
  await page.locator('#participants').getByRole('button', { name: s.searchButton, exact: true }).click()
})

When('the user searches customers using a link with the {word} {string}', async ({ page }, field, value) => {
  const key = { qalNumber: 'QalNumber', accountNumber: 'AccountNumber', name: 'Name' }[field]
  await page.goto(`${internal.routes.search}?tab=Customers&Customer.${key}=${encodeURIComponent(value)}`)
})

When('the user searches participants using a link with the lab code {string}', async ({ page }, value) => {
  await page.goto(`${internal.routes.search}?tab=Participants&Participant.LabCode=${encodeURIComponent(value)}`)
})

Then('the search results panel is shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: s.resultsHeading, exact: true }).first()).toBeVisible()
})

Then('the search reports that there are no results', async ({ page }) => {
  await expect(page.getByText(s.noResults, { exact: true }).first()).toBeVisible()
})

Then('the customer search results include the seed customer', async ({ page, state }) => {
  await expect(resultsRows(page, 'customers').filter({ hasText: state.seed.name }).first()).toBeVisible()
})

Then('the search page shows the error {string}', async ({ page }, message) => {
  await expect(page.locator('.govuk-error-summary').getByRole('link', { name: message, exact: true })).toBeVisible()
})

Then('the {word} search field accepts at most {int} characters', async ({ page }, field, max) => {
  await expect(page.getByLabel(labelOf(field), { exact: true }).first()).toHaveAttribute('maxlength', String(max))
})

Then('the search page does not show an error page', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(internal.pages.search.heading)
})


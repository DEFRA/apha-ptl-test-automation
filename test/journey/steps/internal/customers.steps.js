/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests; move to *.assertions.js when next edited */
import { When, Then, expect } from '../../support/fixtures.js'
import { internal } from '../../content/internal.js'
import { expectInternalPage } from '../../assertions/internal.assertions.js'

// source: Features/Customer/Views/Index.cshtml, Create.cshtml, _CustomerForm.cshtml, CustomerViewModel.cs

const summary = (page) => page.locator('.govuk-error-summary') // source: GovUkErrorSummaryTagHelper.cs
const tableRows = (page) => page.getByRole('table').getByRole('row').filter({ has: page.locator('td') })

When('the user opens the internal customer list', async ({ page }) => {
  await page.goto(internal.routes.customers)
})

Then('the internal customer list is shown', async ({ page, role }) => {
  await expectInternalPage(page, { heading: internal.pages.customers.heading, role })
})

Then('the customer list offers the Active, Inactive and All status filters', async ({ page }) => {
  const options = await page.getByLabel('Status').locator('option').allTextContents()
  expect(options.map((o) => o.trim())).toEqual(internal.customers.statuses)
})

Then('the customer table has the expected columns', async ({ page }) => {
  const empty = page.getByText(internal.customers.empty)
  if (await empty.isVisible()) return // no customers for the default Active filter; nothing to show
  await expect(page.getByRole('columnheader')).toHaveText(internal.customers.columns)
})

When('the user filters the customer list by status {string}', async ({ page }, status) => {
  await page.getByLabel('Status').selectOption({ label: status })
  await page.getByRole('button', { name: internal.customers.filterButton, exact: true }).click()
  await expect(page.getByLabel('Status')).toHaveValue(status)
})

Then('every customer listed has the status {string}', async ({ page }, status) => {
  const empty = page.getByText(internal.customers.empty)
  if (await empty.isVisible()) return // an empty result is a valid outcome of the filter
  const tags = page.getByRole('table').locator('.govuk-tag')
  await expect(tags.first()).toBeVisible()
  for (const text of await tags.allTextContents()) expect(text.trim()).toBe(status)
})

When('the user opens the internal create customer form', async ({ page }) => {
  await page.goto(internal.routes.customerCreate)
  await expectInternalPage(page, { heading: internal.pages.customerCreate.heading, role: 'internal' })
})

When('the user submits the create customer form without entering anything', async ({ page }) => {
  await page.getByRole('button', { name: internal.customerForm.submit, exact: true }).click()
})

When('the user enters {string} in the customer field {string}', async ({ page }, value, label) => {
  await page.getByLabel(label, { exact: true }).fill(value)
})

When('the user enters {int} characters in the customer field {string}', async ({ page }, count, label) => {
  await page.getByLabel(label, { exact: true }).fill('A'.repeat(count))
})

Then('the customer field {string} accepts at most {int} characters', async ({ page }, label, max) => {
  await expect(page.getByLabel(label, { exact: true })).toHaveAttribute('maxlength', String(max)) // source: StringLength(50) on Name
})

When('the user submits the create customer form', async ({ page }) => {
  await page.getByRole('button', { name: internal.customerForm.submit, exact: true }).click()
})

Then('the create customer form shows the error {string}', async ({ page }, message) => {
  await expect(page.getByRole('heading', { name: internal.customerForm.summaryTitle })).toBeVisible()
  await expect(summary(page).getByRole('link', { name: message, exact: true })).toBeVisible()
})

Then('the create customer form shows the mandatory field errors', async ({ page }) => {
  const { nameRequired, typeRequired } = internal.customerForm.errors
  await expect(summary(page).getByRole('link', { name: nameRequired, exact: true })).toBeVisible()
  await expect(summary(page).getByRole('link', { name: typeRequired, exact: true })).toBeVisible()
})

Then('selecting an error link moves focus to its field', async ({ page }) => {
  await summary(page).getByRole('link', { name: internal.customerForm.errors.nameRequired, exact: true }).click()
  await expect(page.getByLabel(internal.customerForm.nameLabel, { exact: true })).toBeFocused() // source: govuk-frontend error-summary module
})

When('the user cancels the create customer form', async ({ page }) => {
  await page.getByRole('link', { name: internal.customerForm.cancel, exact: true }).click()
})

Then('the user is back on the customer list', async ({ page, role }) => {
  await expectInternalPage(page, { heading: internal.pages.customers.heading, role, scan: false })
})

When('the customer list has at least one row to work with', async ({ page, state }) => {
  const first = tableRows(page).first()
  await expect(first, 'seed customer for read-only search tests').toBeVisible()
  const cells = await first.getByRole('cell').allTextContents()
  state.seed = { qal: cells[0].trim(), name: cells[1].trim() }
})



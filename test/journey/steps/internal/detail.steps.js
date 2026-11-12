/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import { When, Then, expect } from '../../support/fixtures.js'
import { internal } from '../../content/internal.js'
import { expectInternalPage } from '../../assertions/internal.assertions.js'

// source: Features/Customer/Views/Details.cshtml, Edit.cshtml; Participant/Views/Index.cshtml, Create.cshtml;
// GroupAddress/Views/Create.cshtml; Scheme/Views/Create.cshtml; Contract/Views/Create.cshtml

const summary = (page) => page.locator('.govuk-error-summary') // source: GovUkErrorSummaryTagHelper.cs
const sideNav = (page) => page.getByRole('navigation', { name: 'Primary navigation' })

When('the user opens the details of the first customer in the list', async ({ page, state }) => {
  const row = page.getByRole('table').getByRole('row').filter({ has: page.locator('td') }).first()
  state.customerName = (await row.getByRole('cell').nth(1).textContent()).trim()
  await row.getByRole('link', { name: 'Details', exact: true }).click()
})

Then('the customer details page shows the customer name and its sections', async ({ page, state, role }) => {
  await expectInternalPage(page, { heading: state.customerName, role })
  for (const section of internal.customerDetails.sections) {
    await expect(page.getByRole('heading', { level: 2, name: section, exact: true })).toBeVisible()
  }
})

Then('the customer details page offers the customer actions', async ({ page }) => {
  for (const action of internal.customerDetails.actions) {
    await expect(page.getByRole('link', { name: action, exact: true })).toBeVisible()
  }
})

When('the user follows {string} from the customer details', async ({ page }, link) => {
  await page.getByRole('link', { name: link, exact: true }).click()
})

Then('the internal page headed {string} is shown', async ({ page, role }, heading) => {
  await expectInternalPage(page, { heading, role })
})

When('the user opens the edit form for the customer', async ({ page }) => {
  await page.getByRole('link', { name: 'Edit Customer', exact: true }).click()
  await expectInternalPage(page, { heading: 'Edit Customer', role: 'internal' })
})

Then('the edit customer form is filled with the customer name', async ({ page, state }) => {
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue(state.customerName)
})

When('the user clears the customer name and saves the changes', async ({ page }) => {
  await page.getByLabel('Name', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click()
})

When('the user opens the customer list with the paging query {string}', async ({ page }, query) => {
  await page.goto(`${internal.routes.customers}?${query}`)
})

Then('the customer list is still shown', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(internal.pages.customers.heading)
})

When('the user opens the create form at {string}', async ({ page }, path) => {
  await page.goto(path)
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(/^Create/)
})

When('the user opens the create form for {string} from the customer', async ({ page }, kind) => {
  const list = { Participant: 'Participants', Contract: 'Contracts' }[kind]
  await page.getByRole('link', { name: `Go to ${list} Page`, exact: true }).click()
  await sideNav(page).getByRole('link', { name: `Create ${kind}`, exact: true }).click()
})

When('the user submits the form with the {string} button', async ({ page }, name) => {
  await page.getByRole('button', { name, exact: true }).click()
})

Then('the form shows the error {string}', async ({ page }, message) => {
  await expect(page.getByRole('heading', { name: internal.customerForm.summaryTitle })).toBeVisible()
  await expect(summary(page).getByText(message, { exact: true }).first()).toBeVisible() // some summary entries are plain text, not links
})

Then('the form field {string} accepts at most {int} characters', async ({ page }, label, max) => {
  await expect(page.getByLabel(label, { exact: true })).toHaveAttribute('maxlength', String(max))
})


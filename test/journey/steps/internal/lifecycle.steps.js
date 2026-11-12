/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import { Given, When, Then, expect } from '../../support/fixtures.js'
import { openPageWithItem } from '../../support/paged-list.js'

// source: live probe (docs/internal/discovery) of Customer/Participant/Contract/GroupAddress create and edit; success banners come from the controllers.
// Records cannot be deleted in the app, so every record is synthetic (QAT<runId>) and the customer is deactivated in teardown.

const unique = (runId) => `QAT${runId.replace(/[^a-z0-9]/gi, '')}`
const button = (page, name) => page.getByRole('button', { name, exact: true }).first()
const sideNav = (page) => page.getByRole('navigation', { name: 'Primary navigation' })
const banner = (page) => page.locator('.govuk-notification-banner').filter({ hasNotText: 'Extend session' })
const fill = (page, label, value) => page.getByLabel(label, { exact: true }).first().fill(value)
const pick = (page, label) => page.getByLabel(label, { exact: true }).first().selectOption({ index: 1 })

async function deactivateCustomer(page, name) {
  await page.goto(`/Search/Index?tab=Customers&Customer.Name=${encodeURIComponent(name)}`)
  const link = page.locator('#customers').getByRole('link', { name: /^Details/ }).first()
  if (!(await link.count())) return
  await link.click()
  await page.getByRole('link', { name: 'Edit Customer', exact: true }).click()
  await page.getByLabel('Active', { exact: true }).uncheck()
  await button(page, 'Save Changes').click()
}

async function openCustomer(page, name) {
  await page.goto(`/Search/Index?tab=Customers&Customer.Name=${encodeURIComponent(name)}`)
  await page.locator('#customers').getByRole('link', { name: /^Details/ }).first().click()
}

// ---- customer ---------------------------------------------------------------

Given('a new customer created through the create customer form', async ({ page, state, runId, cleanup }) => {
  state.customer = unique(runId)
  await cleanup(() => deactivateCustomer(page, state.customer))
  await page.goto('/Customer/Create')
  await fill(page, 'Name', state.customer)
  await pick(page, 'Customer Type')
  await pick(page, 'Currency')
  await fill(page, 'Contact Name', 'Jane Smith')
  await fill(page, 'Organisation Name', 'QA Test Organisation')
  await fill(page, 'Address 1', '1 Test Street')
  await fill(page, 'Address 2', 'Testville')
  await pick(page, 'Country')
  await fill(page, 'Telephone', '01234 567890')
  await fill(page, 'Email', `${state.customer.toLowerCase()}@example.com`)
  await fill(page, 'Invoice Organisation Name', 'QA Test Organisation')
  await fill(page, 'Invoice Address 1', '1 Test Street')
  await fill(page, 'Invoice Address 2', 'Testville')
  await pick(page, 'Invoice country')
  await fill(page, 'Invoice Email', `invoice.${state.customer.toLowerCase()}@example.com`)
  await button(page, 'Create Customer').click()
})

Then('the user is told that {string}', async ({ page }, message) => {
  await expect(banner(page)).toContainText(message)
})

When('the user finds the customer by searching for its name', async ({ page, state }) => {
  await openCustomer(page, state.customer)
})

Then('the customer details page is headed with the customer name', async ({ page, state }) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(state.customer)
})

When('the user changes the customer contact name to {string} and saves', async ({ page }, name) => {
  await page.getByRole('link', { name: 'Edit Customer', exact: true }).click()
  await fill(page, 'Contact Name', name)
  await button(page, 'Save Changes').click()
})

Then('the customer details show the contact name {string}', async ({ page }, name) => {
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
})

When('the user deactivates the customer and saves', async ({ page }) => {
  await page.getByRole('link', { name: 'Edit Customer', exact: true }).click()
  await page.getByLabel('Active', { exact: true }).uncheck()
  await button(page, 'Save Changes').click()
})

Then('the customer details show the status {string}', async ({ page }, status) => {
  await expect(page.locator('.govuk-summary-list__row', { hasText: 'Status' }).first()).toContainText(status)
})

// ---- participant ------------------------------------------------------------

When('the user creates a participant for the customer', async ({ page, state, runId }) => {
  state.lab = `${unique(runId)} Lab`
  await page.getByRole('link', { name: 'Go to Participants Page', exact: true }).click()
  await sideNav(page).getByRole('link', { name: 'Create Participant', exact: true }).click()
  await fill(page, 'Lab Name', state.lab)
  await fill(page, 'Contact Name', 'Jane Smith')
  await fill(page, 'Organisation Name', 'QA Test Organisation')
  await fill(page, 'Address 1', '1 Test Street')
  await fill(page, 'Address 2', 'Testville')
  await pick(page, 'Country')
  await fill(page, 'Telephone', '01234 567890')
  await fill(page, 'Email (Primary)', `${state.lab.replace(/\s/g, '').toLowerCase()}@example.com`)
  await button(page, 'Create Participant').click()
})

Then('the participant list includes the new participant', async ({ page, state }) => {
  await expect(page.locator('main tr', { hasText: state.lab }).first()).toBeVisible()
})

When('the user changes the participant contact name to {string} and saves', async ({ page, state }, name) => {
  await page.locator('main tr', { hasText: state.lab }).first().getByRole('link', { name: 'Details' }).click()
  await page.getByRole('link', { name: /^Edit/ }).first().click()
  await fill(page, 'Contact Name', name)
  await page.getByRole('button', { name: /^(Save|Update)/ }).first().click()
})

// ---- contract ---------------------------------------------------------------

When('the user creates a contract for the customer', async ({ page }) => {
  await page.getByRole('link', { name: 'Go to Contracts Page', exact: true }).click()
  await sideNav(page).getByRole('link', { name: 'Create Contract', exact: true }).click()
  await fill(page, 'Contract Signatory', 'Jane Smith')
  await button(page, 'Create Contract').click()
})

Then('the contract list shows one contract for the customer', async ({ page }) => {
  await expect(page.getByRole('table').first().locator('tbody tr')).toHaveCount(1)
})

When('the user changes the contract signatory to {string} and saves', async ({ page }, name) => {
  await page.getByRole('link', { name: 'Details', exact: true }).first().click()
  await page.getByRole('link', { name: /Edit/ }).first().click()
  await fill(page, 'Contract Signatory', name)
  await page.getByRole('button', { name: /^Save/ }).first().click()
})

When('the user opens the contract items of the contract', async ({ page }) => {
  await page.getByRole('link', { name: 'Contract Items', exact: true }).first().click()
})

Then('the contract items page offers to add a contract item', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Additional Charges' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add Contract Item' }).or(page.getByRole('button', { name: 'Add Contract Item' }))).toBeVisible()
})

// ---- group address ----------------------------------------------------------

When('the user creates a group address with a unique identifier', async ({ page, state, runId }) => {
  state.group = unique(runId)
  await page.goto('/GroupAddress/Create')
  await fill(page, 'Identifier', state.group)
  await fill(page, 'Address 1', '1 Test Street')
  await fill(page, 'Address 2', 'Testville')
  await pick(page, 'Country')
  await button(page, 'Save').click()
})

Then('the group address list includes the new group address', async ({ page, state }) => {
  expect(await openPageWithItem(page, '/GroupAddress/Index', state.group), `${state.group} listed`).toBe(true)
})

When('the user changes the group address line 3 to {string} and saves', async ({ page, state }, line) => {
  await openPageWithItem(page, '/GroupAddress/Index', state.group)
  await page.locator('main tr', { hasText: state.group }).first().getByRole('link', { name: /Details/ }).click()
  await page.getByRole('link', { name: /Edit/ }).first().click()
  await fill(page, 'Address 3', line)
  await page.getByRole('button', { name: /^Save/ }).first().click()
})


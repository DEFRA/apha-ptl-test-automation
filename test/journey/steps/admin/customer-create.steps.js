import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openCreateCustomer, fillRequiredCustomerFields, saveCustomer, makeCustomerInactive } from '../../flows/customer-create.flow.js'
import { expectCustomerSaved, expectLabelPrintAnswered } from '../../assertions/customer-create.assertions.js'
import { labelPrint } from '../../content/customer-create.js'

export { test }

const dialogs = new WeakMap()

Given('an admin opens the create customer page', async ({ page, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  const messages = []
  dialogs.set(page, messages)
  page.on('dialog', async (dialog) => { messages.push(dialog.message()); await dialog.accept() }) // source: Customer.aspx.vb:293 MessageBox alert
  await openCreateCustomer(page)
  cleanup(async () => { await makeCustomerInactive(page) }) // a customer cannot be deleted
})

When('they fill every required customer field with the name {string}', async ({ page, runId }, name) => {
  await fillRequiredCustomerFields(page, `${name} ${runId}`.slice(0, 40))
})

When('they save the customer', async ({ page }) => {
  await saveCustomer(page)
})

Then('the customer is saved and the Participants and Contracts buttons appear', async ({ page }) => {
  await expectCustomerSaved(page, dialogs.get(page))
})

When('they press the button {string}', async ({ page }, name) => {
  await page.getByRole('button', { name, exact: true }).click() // source: probe 2026-11-03 Participants and Contracts pages buttons
  await page.waitForLoadState('load')
})

When('they print the first group address label', async ({ page }) => {
  await page.getByRole('link', { name: labelPrint.printLink, exact: true }).first().click() // source: GroupAddress.aspx:22
})

Then('the label print is answered', async ({ page }) => {
  await expectLabelPrintAnswered(page)
})

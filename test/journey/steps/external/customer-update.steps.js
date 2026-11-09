import { Given, When, Then, test } from '../../support/fixtures.js'
import { acquireLock } from '../../support/lock.js'
import { expectCustomerFormLocked, expectCustomerFormEditable, expectContactName } from '../../assertions/customer-update.assertions.js'
import { openCustomerDetails, readContactName, submitContactName, reviewPendingCustomerUpdate, customerFormLocator } from '../../flows/customer-update.flow.js'

export { test }

/** Per-test record of the contact name before the test changed anything. */
const original = new WeakMap()

Given('the seeded customer has no pending details update', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  cleanup(await acquireLock('customer'))
  await reviewPendingCustomerUpdate('Decline', { onlyIfPending: true })
  await openCustomerDetails(page)
  original.set(page, { before: await readContactName(page) })
  cleanup(() => reviewPendingCustomerUpdate('Decline', { onlyIfPending: true }))
})

When('the customer submits a new unique contact name', async ({ page, runId }) => {
  const value = `E2E Contact ${runId}`
  await submitContactName(page, value)
  original.set(page, { ...original.get(page), value })
})

When('the customer submits the contact name unchanged', async ({ page }) => {
  await submitContactName(page, await readContactName(page))
})

When('an admin declines the pending customer update', async () => {
  await reviewPendingCustomerUpdate('Decline')
})

When('an admin approves the pending customer update', async () => {
  await reviewPendingCustomerUpdate('Approve')
})

When('the customer opens their details again', async ({ page }) => {
  await openCustomerDetails(page)
})

Then('the customer details form is locked', async ({ page }) => {
  await expectCustomerFormLocked(customerFormLocator(page)) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:128-132 (DisableForm)
})

Then('the customer details form is editable', async ({ page }) => {
  await expectCustomerFormEditable(customerFormLocator(page)) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:128
})

Then('the contact name is the original value', async ({ page }) => {
  await expectContactName(customerFormLocator(page), original.get(page).before) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx.vb:41 (decline discards the change)
})

Then('the contact name is the submitted value', async ({ page }) => {
  await expectContactName(customerFormLocator(page), original.get(page).value) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:88
})


import { Given, When, Then, test } from '../../support/fixtures.js'
import { acquireLock } from '../../support/lock.js'
import {
  expectCustomerDetailsPageLoaded,
  expectOrderPageLoaded,
  expectCustomerDetailsValidation,
  expectOrderCannotProgress
} from '../../assertions/customer-account.assertions.js'
import { expectCustomerFormLocked } from '../../assertions/customer-update.assertions.js'
import { customerFormLocator } from '../../flows/customer-update.flow.js'

import { changeCustomerContactName } from '../../flows/customer-account.flow.js'
import { reviewPendingCustomerUpdate, submitContactName } from '../../flows/customer-update.flow.js'

export { test }

Given(/a signed-in customer opens the Edit Customer\/Invoice details page/, async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  cleanup(await acquireLock('customer'))
  await reviewPendingCustomerUpdate('Decline', { onlyIfPending: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx.vb:39
  cleanup(() => reviewPendingCustomerUpdate('Decline', { onlyIfPending: true }))
  await page.goto('/EditCustomerDetails.aspx') // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx:11
  await expectCustomerDetailsPageLoaded(page) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx:12
})

Given('a signed-in customer opens the order submission page', async ({ page }) => {
  await page.goto('/PendingContractOrder.aspx?year=current') // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:26
  await expectOrderPageLoaded(page) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:825
})

When('they update the required customer and invoice fields with valid values', async ({ page, runId }) => {
  await submitContactName(page, `E2E Contact ${runId}`) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:84-92
})

When('they leave required customer contact details blank and submit', async ({ page }) => {
  await changeCustomerContactName(page, '') // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:193
})

When('they leave the terms and conditions unchecked and the declarations incomplete', async () => {
  // Nothing is selected, so the wizard stays on the first step. // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566 (BtnNext Enabled=false)
})

Then('the customer details are saved and a success message is shown', async ({ page }) => {
  await expectCustomerFormLocked(customerFormLocator(page)) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:128-132
})

Then('the page shows the required field validation messages and prevents the save', async ({ page }) => {
  await expectCustomerDetailsValidation(page) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:406 (ShowValidation) and client validators
})

Then('the page shows the required terms and consent errors and blocks submission', async ({ page }) => {
  await expectOrderCannotProgress(page) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566,918
})




import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectPageLoaded } from '../../assertions/page.assertions.js'
import {
  expectGroupAddressListed,
  expectGroupAddressValue,
  expectPendingButtons,
  expectPendingTable,
  expectRequiredMessages
} from '../../assertions/data.assertions.js'
import { AdminGroupAddressPage, AdminPendingPage } from '../../pages/admin-data.page.js'
import { openGroupAddressForEdit, readGroupAddress, restoreGroupAddress } from '../../flows/group-address.flow.js'
import { adminPages, groupAddressForm } from '../../content/site.js'
import { webUrl } from '../../support/env.js'

export { test }

/** Per-test record of the group address being edited and the value to put back. */
const state = new WeakMap()

Given('an admin opens the first group address for editing', async ({ page, role, browser, cleanup }) => {
  const { identifier } = await openGroupAddressForEdit(page)
  await expectPageLoaded(page, { heading: adminPages.groupAddressEdit.heading, role })
  const original = await readGroupAddress(page)
  state.set(page, { identifier, original })
  cleanup(() => restoreGroupAddress(browser, webUrl(), identifier, original))
})

When('they change the packing instructions to a unique value', async ({ page, runId }) => {
  const value = `E2E packing note ${runId}`
  await new AdminGroupAddressPage(page).field('packing').fill(value)
  state.get(page).changedPacking = value
})

When('they change the telephone to a synthetic number', async ({ page }) => {
  await new AdminGroupAddressPage(page).field('telephone').fill(groupAddressForm.syntheticTelephone)
})

When('they save the group address', async ({ page }) => {
  await new AdminGroupAddressPage(page).saveButton.click()
})

When('they cancel the group address form', async ({ page }) => {
  await new AdminGroupAddressPage(page).cancelButton.click()
})

When('they reopen the same group address', async ({ page, role }) => {
  await openGroupAddressForEdit(page, state.get(page).identifier)
  await expectPageLoaded(page, { heading: adminPages.groupAddressEdit.heading, role })
})

Then('the packing instructions show the new value', async ({ page }) => {
  await expectGroupAddressValue(new AdminGroupAddressPage(page), 'packing', state.get(page).changedPacking)
})

Then('the packing instructions show the original value', async ({ page }) => {
  await expectGroupAddressValue(new AdminGroupAddressPage(page), 'packing', state.get(page).original.packing)
})

Then('the telephone shows the synthetic number', async ({ page }) => {
  await expectGroupAddressValue(new AdminGroupAddressPage(page), 'telephone', groupAddressForm.syntheticTelephone)
})

Given('an admin opens the create group address page', async ({ page, role }) => {
  await page.goto(adminPages.groupAddresses.route) // source: docs/discovery/crawl-admin.json /Contracts Admin/GroupAddressList.aspx
  await new AdminGroupAddressPage(page).createLink.click()
  await expectPageLoaded(page, { heading: adminPages.groupAddressCreate.heading, role })
})

Then('the four required field messages are shown', async ({ page }) => {
  await expectRequiredMessages(new AdminGroupAddressPage(page))
})

When('they enter a new group address with a unique identifier', async ({ page, runId }) => {
  const form = new AdminGroupAddressPage(page)
  const identifier = `E2E-${runId}`
  await form.field('identifier').fill(identifier)
  await form.field('address1').fill(groupAddressForm.syntheticAddress)
  await form.field('address2').fill('Test Town')
  await form.field('country').selectOption({ index: 1 })
  state.set(page, { identifier })
})

Then('the new group address is listed', async ({ page }) => {
  await expectGroupAddressListed(new AdminGroupAddressPage(page), state.get(page).identifier)
})

When('they open the first pending customer update', async ({ page }) => {
  await new AdminPendingPage(page).detailsLinks.first().click()
})

Then('the pending customer updates table shows its columns and at least one row', async ({ page }) => {
  await expectPendingTable(new AdminPendingPage(page))
})

Then('the pending update shows the Approve, Decline and Cancel buttons', async ({ page }) => {
  await expectPendingButtons(new AdminPendingPage(page))
})

When('they cancel the pending update review', async ({ page }) => {
  await new AdminPendingPage(page).button('Cancel').click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:290
})

When('they approve the first pending customer update', async ({ page }) => {
  await new AdminPendingPage(page).button('Approve').click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:288
})

When('they decline the first pending customer update', async ({ page }) => {
  await new AdminPendingPage(page).button('Decline').click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:289
})

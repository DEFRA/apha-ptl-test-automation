import { Given, When, Then, test } from '../../support/fixtures.js'
import { acquireLock } from '../../support/lock.js'
import { expectCustomerFormLocked, expectCustomerFormEditable, expectContactName } from '../../assertions/customer-update.assertions.js'
import {
  openParticipantDetails,
  readParticipantContactName,
  submitParticipantContactName,
  reviewPendingParticipantUpdate,
  participantFormLocator
} from '../../flows/participant-update.flow.js'

export { test }

/** Per-test record of the contact name before the test changed anything. */
const original = new WeakMap()

Given('the seeded participant has no pending details update', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  cleanup(await acquireLock('participant'))
  await reviewPendingParticipantUpdate('Decline', { onlyIfPending: true })
  await openParticipantDetails(page)
  original.set(page, { before: await readParticipantContactName(page) })
  cleanup(() => reviewPendingParticipantUpdate('Decline', { onlyIfPending: true }))
})

When('the participant submits a new unique contact name', async ({ page, runId }) => {
  await submitParticipantContactName(page, `E2E Participant ${runId}`)
})

When('the participant submits the contact name unchanged', async ({ page }) => {
  await submitParticipantContactName(page, await readParticipantContactName(page))
})

When('an admin declines the pending participant update', async () => {
  await reviewPendingParticipantUpdate('Decline')
})

When('an admin approves the pending participant update', async () => {
  await reviewPendingParticipantUpdate('Approve')
})

When('the participant opens their details again', async ({ page }) => {
  await openParticipantDetails(page)
})

Then('the participant details form is locked', async ({ page }) => {
  await expectCustomerFormLocked(participantFormLocator(page)) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx.vb:109-112
})

Then('the participant details form is editable', async ({ page }) => {
  await expectCustomerFormEditable(participantFormLocator(page)) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx.vb:109
})

Then('the participant contact name is the original value', async ({ page }) => {
  await expectContactName(participantFormLocator(page), original.get(page).before) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingParticipantUpdateDetails.aspx.vb:42-49
})


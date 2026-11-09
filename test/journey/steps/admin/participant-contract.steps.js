import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { participantCreate, contractCreate, signOff } from '../../content/participant-contract.js'
import { fillParticipant, fillContract, openCreateForm, saveForm, makeInactive } from '../../flows/participant-contract.flow.js'
import { expectOnRoute, expectNoServerError } from '../../assertions/full-functions.assertions.js'

export { test }

const forms = { participant: participantCreate, contract: contractCreate }

Given('an admin has opened the {string} list of the first customer', async ({ page }, list) => {
  await page.goto('/Contracts Admin/CustomerList.aspx') // source: probe 2026-11-03
  await page.getByRole('link', { name: list, exact: true }).first().click() // sets the customer in the session
  await page.waitForLoadState('load')
})

When('they open the create {string} form', async ({ page, cleanup }, kind) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  await openCreateForm(page, forms[kind])
  cleanup(async () => { await makeInactive(page, forms[kind]) }) // neither can be deleted
})

When('they fill the new {string} with a unique value', async ({ page, runId }, kind) => {
  if (kind === 'participant') await fillParticipant(page, `E2E Lab ${runId}`.slice(0, 40), runId)
  else await fillContract(page, runId)
})

When('they save the {string} form', async ({ page }, kind) => {
  await saveForm(page, forms[kind])
})

Then('no server error is shown after saving the {string}', async ({ page }, _kind) => {
  await expectOnRoute(page, decodeURIComponent(new URL(page.url()).pathname))
})

When('they press {string} on the tabulation', async ({ page, cleanup }, action) => {
  await holdLock(page, 'admin-full', cleanup)
  await page.getByRole('button', { name: signOff[action], exact: true }).click() // source: Tabulation.aspx:72-73
  await page.waitForLoadState('load')
})

Then('the tabulation page is answered without a server error', async ({ page }) => {
  await expectNoServerError(page)
})

import { Then, When, test } from '../../support/fixtures.js'
import { expectParticipantForm, expectParticipantMessage } from '../../assertions/data.assertions.js'
import { ExternalParticipantPage } from '../../pages/external-participant.page.js'
import { participantForm, participantMessages } from '../../content/site.js'

export { test }

When('they submit the participant form without a country', async ({ page, runId }) => {
  const form = new ExternalParticipantPage(page)
  await form.fillRequiredText(runId)
  await form.updateButton.click()
})

When('they submit the participant form with valid synthetic details', async ({ page, runId }) => {
  const form = new ExternalParticipantPage(page)
  await form.fillRequiredText(runId)
  await form.chooseCountry('Afghanistan')
  await form.updateButton.click()
})

Then('the participant country message is shown', async ({ page }) => {
  await expectParticipantMessage(page, participantMessages.country)
})

Then('the participant update confirmation is shown', async ({ page }) => {
  await expectParticipantMessage(page, participantMessages.submitted)
})

Then('the participant form shows its fields and buttons', async ({ page }) => {
  await expectParticipantForm(page)
})

When('they cancel the participant form', async ({ page }) => {
  await page.getByRole('button', { name: participantForm.cancel, exact: true }).click() // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
})

import { Given, When, test } from '../../support/fixtures.js'
import { followClickPath } from '../../flows/click-path.flow.js'
import { SurveyPage } from '../../pages/survey.page.js'

export { test }

Given('an admin follows the click path {string}', async ({ page }, path) => {
  page.on('dialog', (dialog) => dialog.dismiss())
  await followClickPath(page, path)
})

When('they clear the {string} field and save', async ({ page }, field) => {
  const survey = new SurveyPage(page)
  await survey.field(field).fill('')
  await survey.saveButton('ButtonSave').click()
})

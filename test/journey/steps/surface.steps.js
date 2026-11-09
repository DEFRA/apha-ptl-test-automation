import { Given, When, Then, test } from '../support/fixtures.js'
import { expectPageLoaded } from '../assertions/page.assertions.js'
import { expectOperation, expectSurveyedPage, expectValidationMessage, expectWsdl } from '../assertions/surface.assertions.js'
import { SurveyPage } from '../pages/survey.page.js'
import { forms, surveyed } from '../content/surveyed.js'
import { webServicesUrl } from '../support/env.js'

export { test }

/** Last WSDL body per request context. */
const descriptions = new WeakMap()

Given('the surveyed {string} page is opened', async ({ page, role }, key) => {
  const target = surveyed[key]
  await page.goto(target.route) // source: content/surveyed.js (data/pages.json)
  await expectSurveyedPage(page, target, role)
})

Then('the surveyed {string} page is shown', async ({ page, role }, key) => {
  await expectSurveyedPage(page, surveyed[key], role)
})

When('they select the Home breadcrumb link', async ({ page }) => {
  await new SurveyPage(page).homeLink.click()
})

Then('the destination heading is {string}', async ({ page, role }, heading) => {
  await expectPageLoaded(page, { heading, role })
})

Given('an admin opens the {string} form', async ({ page }, key) => {
  await page.goto('/' + forms[key].rel) // source: content/surveyed.js (data/forms.json)
})

When('they save the empty form', async ({ page }, ) => {
  const url = new URL(page.url())
  const form = Object.values(forms).find((f) => decodeURI(url.pathname).endsWith(f.rel))
  await new SurveyPage(page).saveButton(form.button).click()
})

Then('the validation message {string} is shown', async ({ page }, text) => {
  await expectValidationMessage(new SurveyPage(page), text)
})

Given('the web service {string} description is requested', async ({ request }, service) => {
  const response = await request.get(`${webServicesUrl()}/${service}?WSDL`) // source: data/services.json (survey 2026-11-02)
  descriptions.set(request, { status: response.status(), body: await response.text() })
})

Then('the description is a WSDL document', async ({ request }) => {
  const result = descriptions.get(request)
  expectWsdl(result.body)
})

Then('the description lists the operation {string}', async ({ request }, operation) => {
  expectOperation(descriptions.get(request).body, operation)
})

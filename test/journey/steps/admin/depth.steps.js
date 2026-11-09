import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectRowChanged, expectSoapResult, expectVisible } from '../../assertions/depth.assertions.js'
import { SurveyPage } from '../../pages/survey.page.js'

export { test }

/** First list row noted before paging, per page. */
const noted = new WeakMap()

/** Last SOAP response per request context. */
const soapResponses = new WeakMap()

Then('the page shows the button {string}', async ({ page }, name) => {
  await expectVisible(new SurveyPage(page).button(name))
})

Then('the page shows the label {string}', async ({ page }, label) => {
  await expectVisible(new SurveyPage(page).text(label))
})

Then('the page shows the tab {string}', async ({ page }, tab) => {
  await expectVisible(new SurveyPage(page).text(tab))
})

When('they cancel the form', async ({ page }) => {
  await new SurveyPage(page).button('Cancel').click()
})

When('they note the first row of the list', async ({ page }) => {
  noted.set(page, await new SurveyPage(page).firstRow.innerText())
})

When('they select page {string} of the list', async ({ page }, number) => {
  await new SurveyPage(page).link(number).click()
  await page.waitForLoadState('load')
})

Then('the first row of the list has changed', async ({ page }) => {
  await expectRowChanged(new SurveyPage(page).firstRow, noted.get(page))
})

When('they select the year {string} in the {string} dropdown', async ({ page }, year, selector) => {
  await new SurveyPage(page).select(selector).selectOption({ label: year })
  await page.waitForLoadState('load')
})

Given('the SOAP operation {string} of service {string} is called', async ({ request }, operation, service) => {
  const base = `http://localhost:1935/${service}` // source: data/depth.json (survey 2026-11-02)
  const wsdl = await (await request.get(`${base}?WSDL`)).text()
  const ns = /targetNamespace="([^"]+)"/.exec(wsdl)[1]
  const envelope = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${operation} xmlns="${ns}" /></soap:Body></soap:Envelope>`
  const response = await request.post(base, { headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"${ns.replace(/\/$/, '')}/${operation}"` }, data: envelope })
  soapResponses.set(request, { status: response.status(), body: await response.text() })
})

Then('the SOAP response contains the {string} result', async ({ request }, operation) => {
  expectSoapResult(soapResponses.get(request), operation)
})

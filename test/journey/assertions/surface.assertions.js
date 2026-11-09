import { expect } from '@playwright/test'
import { expectPageLoaded } from './page.assertions.js'

/** A surveyed page shows its recorded heading; pages without an h1 are checked by title only. */
export async function expectSurveyedPage(page, surveyedPage, role) {
  if (surveyedPage.heading) await expectPageLoaded(page, { heading: surveyedPage.heading, role })
  else await expect(page).toHaveTitle(surveyedPage.title)
}

export async function expectValidationMessage(survey, text) {
  await expect(survey.validationMessage(text)).toBeVisible()
}

export function expectWsdl(body) {
  expect(body).toContain('wsdl:definitions')
}

export function expectOperation(body, operation) {
  expect(body).toContain(`<wsdl:operation name="${operation}"`)
}

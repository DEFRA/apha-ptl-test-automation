import { BasePage } from './base.page.js'

/** Generic locators for surveyed pages and forms. */
export class SurveyPage extends BasePage {
  get homeLink() { // source: docs/discovery/crawl-admin.json Home link on every admin page
    return this.page.getByRole('link', { name: 'Home', exact: true }).first() // source: docs/discovery/crawl-admin.json Home link on every admin page
  }

  /** @param {string} idSuffix */
  saveButton(idSuffix) {
    return this.page.locator(`[id$="${idSuffix}"]`).first() // source: data/forms.json button ids from the survey
  }

  /** @param {string} name */
  link(name) {
    return this.page.getByRole('link', { name, exact: true }).first() // source: data/drill-chains.json link names from the survey
  }

  /** @param {string} name */
  button(name) {
    return this.page.getByRole('button', { name, exact: true }).first() // source: data/depth.json button names from the survey
  }

  /** @param {string} text */
  text(text) {
    return this.page.getByText(text, { exact: true }).first() // source: data/depth.json labels and tabs from the survey
  }

  get firstRow() { // source: data/depth2.json first list row from the survey
    return this.page.locator('tr:has(> td > a)').first() // source: data/depth2.json first list row from the survey
  }

  /** @param {string} idSuffix */
  select(idSuffix) {
    return this.page.locator(`[id$="${idSuffix}"]`).first() // source: data/depth2.json year selectors from the survey
  }

  /** @param {string} idSuffix */
  field(idSuffix) {
    return this.page.locator(`[id$="${idSuffix}"]`).first() // source: data/field-validation.json control ids from the survey
  }

  /** @param {string} text validator message (image alt text or inline text) */
  validationMessage(text) {
    return this.page.locator('span[id*="Validator"]:visible').filter({ has: this.page.getByAltText(text, { exact: true }) }).or(this.page.locator('span[id*="Validator"]:visible', { hasText: text })).first() // source: data/forms.json messages from the survey
  }
}

import { byProfile } from '../support/profiles.js'
import { textPattern } from '../support/text.js'
import { Component } from './component.js'

/**
 * The GOV.UK error summary: a titled box of links, each pointing at the field id.
 * Legacy apps often render inline errors only, so `exists` is false there and flows
 * assert inline messages instead (skill `gds-migration-resilience`, Rule 6).
 */
export class ErrorSummary extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ title: string }} [labels]
   * @param {import('@playwright/test').Locator} [root]
   */
  constructor(page, { title } = /** @type {any} */ ({}), root) {
    super(page, root)
    this.title = title ?? 'There is a problem'
  }

  get exists() {
    return byProfile({
      legacy: false, // legacy-only: no summary; inline errors only
      gds: true
    })
  }

  get summary() {
    return this.page.locator('.govuk-error-summary')
  }

  get heading() {
    return this.summary.getByRole('heading', { name: textPattern(this.title) })
  }

  get links() {
    return this.summary.getByRole('link')
  }

  /**
   * The summary link that must point at a field id.
   * @param {string} fieldId
   */
  linkFor(fieldId) {
    return this.summary.locator(`a[href="#${fieldId}"]`)
  }

  /** @param {string} fieldId */
  async followLinkFor(fieldId) {
    await this.linkFor(fieldId).click()
  }
}

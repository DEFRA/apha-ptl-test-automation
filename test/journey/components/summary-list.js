import { Component } from './component.js'

/**
 * The GOV.UK summary list (check-your-answers). It is a definition list, not a table,
 * so rows are found by their key text rather than by row index.
 */
export class SummaryList extends Component {
  /** @param {import('@playwright/test').Locator} [root] */
  constructor(page, root) {
    super(page, root)
  }

  get list() {
    return this.root.locator('.govuk-summary-list')
  }

  /** @param {string} key */
  row(key) {
    return this.list.locator('.govuk-summary-list__row').filter({ hasText: key })
  }

  /** @param {string} key */
  value(key) {
    return this.row(key).locator('.govuk-summary-list__value')
  }

  /** @param {string} key */
  changeLink(key) {
    return this.row(key).getByRole('link')
  }

  /** @param {string} key */
  async change(key) {
    await this.changeLink(key).click()
  }

  /** Every key in the list, in document order. */
  async keys() {
    return this.list.locator('.govuk-summary-list__key').allTextContents()
  }
}

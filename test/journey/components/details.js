import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK details (disclosure) component — https://design-system.service.gov.uk/components/details/
 * It is a native `<details>` element, so its state is the `open` attribute, not a class.
 * Expand it before asserting on anything inside it: collapsed content is not visible.
 */
export class Details extends Component {
  /** @param {import('@playwright/test').Locator} [root] */
  constructor(page, root) {
    super(page, root)
  }

  get all() {
    return byProfile({
      legacy: this.root.locator('[data-details]'), // legacy-only: replace with the real widget
      gds: this.root.locator('.govuk-details')
    })
  }

  /**
   * The disclosure with the given summary text.
   * @param {string} summary
   */
  item(summary) {
    return this.all.filter({
      has: this.page.getByText(summary, { exact: true })
    })
  }

  /**
   * @param {string} summary
   * @returns {import('@playwright/test').Locator}
   */
  summary(summary) {
    return this.item(summary).locator('summary')
  }

  /**
   * @param {string} summary
   * @returns {import('@playwright/test').Locator}
   */
  content(summary) {
    return this.item(summary).locator('.govuk-details__text')
  }

  /**
   * Expand the disclosure unless it is already open.
   * @param {string} summary
   */
  async open(summary) {
    const details = this.item(summary)
    if ((await details.getAttribute('open')) === null) {
      await this.summary(summary).click()
    }
  }

  /**
   * Collapse the disclosure unless it is already closed.
   * @param {string} summary
   */
  async close(summary) {
    const details = this.item(summary)
    if ((await details.getAttribute('open')) !== null) {
      await this.summary(summary).click()
    }
  }

  /**
   * @param {string} summary
   * @returns {Promise<boolean>}
   */
  async isOpen(summary) {
    return (await this.item(summary).getAttribute('open')) !== null
  }

  /**
   * The text of an expanded disclosure's panel.
   * @param {string} summary
   */
  async textOf(summary) {
    return ((await this.content(summary).textContent()) ?? '').trim()
  }
}

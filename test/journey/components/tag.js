import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK tag — https://design-system.service.gov.uk/components/tag/
 * A tag is a status label, not a button: never click it, and never assert on its colour class.
 * Assert the status text, which the service owns and puts in `content/`.
 */
export class Tag extends Component {
  /** @param {import('@playwright/test').Locator} [root] */
  constructor(page, root) {
    super(page, root)
  }

  get all() {
    return byProfile({
      legacy: this.root.locator('[data-tag]'), // legacy-only: replace with the real widget
      gds: this.root.locator('.govuk-tag')
    })
  }

  /**
   * The tag whose text is a known status from `content/`.
   * @param {string} status
   */
  tag(status) {
    return this.all.filter({ hasText: status })
  }

  /**
   * Every status shown in this region, trimmed, in document order.
   * @returns {Promise<string[]>}
   */
  async statuses() {
    return (await this.all.allTextContents()).map((text) => text.trim())
  }

  /**
   * @param {string} status
   * @returns {Promise<boolean>}
   */
  async isShown(status) {
    return (await this.tag(status).count()) > 0
  }
}

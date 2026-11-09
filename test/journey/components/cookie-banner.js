import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK cookie banner. It appears on the first visit in a fresh browser context,
 * adds a form and two buttons to the page (which changes the accessibility template
 * fingerprint), and must be dismissed before the first journey assertion.
 * In `legacy` there is no banner, and `dismissIfPresent` does nothing.
 */
export class CookieBanner extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ accept: string, reject: string, hide: string }} labels
   */
  constructor(page, labels) {
    super(page)
    this.labels = labels
  }

  get banner() {
    return byProfile({
      legacy: this.page.locator('[data-cookie-banner]'), // legacy-only: normally absent
      gds: this.page.locator('.govuk-cookie-banner')
    })
  }

  /** True when the banner is on screen right now. Not a replacement for an assertion. */
  async isVisible() {
    return this.banner.isVisible()
  }

  /** @param {'accept' | 'reject'} choice */
  async choose(choice) {
    const button = this.banner.getByRole('button', { name: choice === 'accept' ? this.labels.accept : this.labels.reject, exact: true })
    await button.click()
  }

  async hide() {
    await this.banner.getByRole('button', { name: this.labels.hide, exact: true }).click()
  }

  /**
   * Accept analytics cookies once and close the banner, so the rest of the journey sees
   * the page the tests were written against. Safe to call on every page load.
   * @returns {Promise<boolean>} true when a banner was dismissed
   */
  async dismissIfPresent() {
    if (!(await this.isVisible())) return false
    await this.choose('accept')
    await this.hide()
    return true
  }
}

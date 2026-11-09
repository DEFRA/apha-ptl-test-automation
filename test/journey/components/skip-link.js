import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK skip link. It is the first tab stop on every page, which silently breaks
 * keyboard tests written against the legacy UI, where the first Tab lands on the logo.
 * Use it explicitly at the start of a keyboard journey.
 */
export class SkipLink extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ label: string }} labels
   */
  constructor(page, labels) {
    super(page)
    this.label = labels.label
  }

  get link() {
    return byProfile({
      legacy: this.page.locator('[data-skip-link]'), // legacy-only: may be absent before the migration
      gds: this.page.getByRole('link', { name: this.label, exact: true })
    })
  }

  /** Move focus to the first tab stop and return the focused element's text. */
  async focusFirst() {
    await this.page.keyboard.press('Tab')
    return this.page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
  }

  /** Activate the focused skip link; focus should land in `main`. */
  async follow() {
    await this.page.keyboard.press('Enter')
  }

  /** Where focus sits after following the skip link. */
  async focusedAfterFollow() {
    return this.page.evaluate(() => {
      const active = document.activeElement
      return { tag: active?.tagName.toLowerCase() ?? '', id: active?.id ?? '' }
    })
  }
}

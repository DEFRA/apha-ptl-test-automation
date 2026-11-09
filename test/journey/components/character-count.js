import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * A textarea with the GOV.UK character count. GDS-only: the legacy UI has no live counter,
 * so instantiating this under `legacy` throws (see `countMessage`), which is the signal
 * that the flow needs a `byProfile` branch rather than a silent fallback.
 */
export class CharacterCount extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ id: string, label: string }} field
   * @param {import('@playwright/test').Locator} [root]
   */
  constructor(page, { id, label }, root) {
    super(page, root)
    this.id = id
    this.label = label
  }

  get textarea() {
    return byProfile({
      legacy: this.root.locator(`#${this.id}`), // legacy-only: plain textarea, no counter
      gds: this.root.getByLabel(this.label, { exact: true })
    })
  }

  get countMessage() {
    return byProfile({
      legacy: /** @type {any} */ (null), // legacy-only: absent before the migration
      gds: this.root.locator('.govuk-character-count__message')
    })
  }

  /** @param {string} value */
  async enter(value) {
    await this.textarea.fill(value)
  }

  /** Characters left according to the counter, or null when there is no counter. */
  async remaining() {
    if (!this.countMessage) return null
    const text = (await this.countMessage.textContent()) ?? ''
    const match = text.match(/-?\d[\d,]*/)
    return match ? Number(match[0].replace(/,/g, '')) : null
  }

  get error() {
    return this.errorFor(this.id)
  }
}

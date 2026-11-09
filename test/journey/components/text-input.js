import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * A single-line input. In `gds` it is located by its label; in `legacy` by its id,
 * because legacy ids (`ctl00_txtEmail`) are the only stable hook.
 */
export class TextInput extends Component {
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

  get input() {
    return byProfile({
      legacy: this.root.locator(`#${this.id}`), // legacy-only: id-based lookup
      gds: this.root.getByLabel(this.label, { exact: true })
    })
  }

  get hint() {
    return this.root.locator(`#${this.id}-hint`)
  }

  get error() {
    return this.errorFor(this.id)
  }

  /** @param {string} value */
  async enter(value) {
    await this.input.fill(value)
  }

  async clear() {
    await this.input.clear()
  }

  async value() {
    return this.input.inputValue()
  }
}

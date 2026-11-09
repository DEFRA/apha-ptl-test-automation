import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/** A checkbox group, located by role in `gds`. */
export class Checkboxes extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ id: string, legend: string }} field
   * @param {import('@playwright/test').Locator} [root]
   */
  constructor(page, { id, legend }, root) {
    super(page, root)
    this.id = id
    this.legend = legend
  }

  get group() {
    return this.root.getByRole('group', { name: this.legend })
  }

  /** @param {string} label */
  option(label) {
    return byProfile({
      legacy: this.root.getByLabel(label), // legacy-only: label/for markup
      gds: this.group.getByRole('checkbox', { name: label })
    })
  }

  /** @param {string[]} labels */
  async check(labels) {
    for (const label of labels) await this.option(label).check()
  }

  /** @param {string[]} labels */
  async uncheck(labels) {
    for (const label of labels) await this.option(label).uncheck()
  }

  get error() {
    return this.errorFor(this.id)
  }
}

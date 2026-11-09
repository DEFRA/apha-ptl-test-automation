import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * A radio group. Legacy custom widgets often use styled links or `div` click handlers;
 * GOV.UK Frontend uses real `input[type=radio]` inside a fieldset. In `legacy` the
 * profile branch must be replaced by the real widget's interaction.
 */
export class Radios extends Component {
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
      legacy: this.group.getByText(label, { exact: true }), // legacy-only: styled labels, not inputs
      gds: this.group.getByRole('radio', { name: label })
    })
  }

  /** @param {string} label */
  async select(label) {
    await this.option(label).check()
  }

  async selectedValue() {
    return this.page.locator('input[type=radio]:checked').getAttribute('value')
  }

  get error() {
    return this.errorFor(this.id)
  }
}
